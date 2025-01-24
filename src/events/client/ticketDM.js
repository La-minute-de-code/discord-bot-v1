const { GUILD_ID, ADMIN_ROLE, SALON_TICKETS, OPENAI_API_KEY, PREFIX_RESPONSE, PREFIX_RESPONSE_ANONYME } = process.env;
const { ChannelType, PermissionsBitField } = require('discord.js');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const messageLanguages = new Map();

async function detectLanguage(text) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Tu es un expert en détection de langue. Réponds uniquement par le code ISO de la langue détectée (ex: 'fr' pour français, 'en' pour anglais, etc.). Si tu n'es pas sûr, réponds rien."
                },
                {
                    role: "user",
                    content: `Détecte la langue de ce texte: "${text}"`
                }
            ],
            temperature: 0
        });

        return response.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
        console.error('Erreur lors de la détection de la langue:', error);
        return 'unknown';
    }
}

async function translateText(text, targetLanguage) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `Tu es un expert en traduction vers le ${targetLanguage === 'fr' ? 'français' : 'la langue cible'}. Traduis le texte donné en ${targetLanguage === 'fr' ? 'français' : 'dans la même langue que le message original'} en conservant le ton et le style du message original.`
                },
                {
                    role: "user",
                    content: `Traduis ce texte en ${targetLanguage}: "${text}"`
                }
            ],
            temperature: 0.3
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Erreur lors de la traduction:', error);
        return null;
    }
}

module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        if (message.author.bot) return;
        const guild = client.guilds.cache.get(GUILD_ID);

        // Gestion des messages dans les tickets
        if (message.channel.parentId === SALON_TICKETS && !message.content.startsWith(PREFIX_RESPONSE) && !message.content.startsWith(PREFIX_RESPONSE_ANONYME)) {
            if (message.reference) {
                try {
                    const originalMessage = await message.channel.messages.fetch(message.reference.messageId);
                    const translatedMessage = await message.channel.messages.fetch(message.reference.messageId + 1).catch(() => null);
                    
                    let targetLanguage = messageLanguages.get(originalMessage.id);
                    
                    if (!targetLanguage && translatedMessage) {
                        targetLanguage = messageLanguages.get(translatedMessage.id);
                    }
                    
                    if (targetLanguage && targetLanguage !== 'fr' && targetLanguage !== 'unknown') {
                        const translation = await translateText(message.content, targetLanguage);
                        if (translation) {
                            const translatedResponse = await message.channel.send(`🔄 Traduction : ${translation}`);
                            messageLanguages.set(translatedResponse.id, targetLanguage);

                            // Envoyer la traduction en DM à l'utilisateur
                            const ticketAuthorUsername = message.channel.name.split('-')[1];
                            const user = client.users.cache.find(user => user.id === ticketAuthorUsername);
                            if (user) {
                                await user.send(`🔄 Traduction de la réponse : ${translation}`);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Erreur lors de la traduction de la réponse:', error);
                }
                return;
            }

            const language = await detectLanguage(message.content);
            let translatedContent = '';
            
            if (language !== 'fr' && language !== 'unknown') {
                const translation = await translateText(message.content, 'fr');
                if (translation) {
                    const translatedMessage = await message.channel.send(`🔄 Traduction : ${translation}`);
                    messageLanguages.set(message.id, language);
                    messageLanguages.set(translatedMessage.id, language);
                }
            }

            setTimeout(() => {
                messageLanguages.delete(message.id);
            }, 900000); // 15 minutes
            return;
        }

        if (message.channel.type === 'DM' || message.channel.type === 1) {
            const category = guild.channels.cache.get(SALON_TICKETS);
            
            if (!category) {
                message.author.send("Erreur: La catégorie des tickets n'est pas configurée correctement. Veuillez contacter un administrateur.");
                return;
            }

            const idAuthor = message.author.id;
            const existingTicketChannel = guild.channels.cache.find(channel => channel.name === `ticket-${idAuthor}` && channel.parentId === SALON_TICKETS);

            if (message.attachments.size > 0) {
                message.author.send("Vous ne pouvez pas envoyer de pièce jointe par ticket. Ce que vous pouvez faire en revanche, c'est d'héberger votre image sur https://imgur.com/ par exemple puis nous envoyer le lien.")
                return;
            }

            const language = await detectLanguage(message.content);
            let translatedContent = '';
            
            if (language !== 'fr' && language !== 'unknown') {
                const translation = await translateText(message.content, 'fr');
                if (translation) {
                    translatedContent = `\n🔄 Traduction : ${translation}`;
                }
            }

            if (existingTicketChannel) {
                const sentMessage = await existingTicketChannel.send(`**${message.author.username}** :\n${message.content}${translatedContent}`);
                if (language !== 'fr' && language !== 'unknown') {
                    messageLanguages.set(sentMessage.id, language);
                }
            } else {
                const ticketChannel = await guild.channels.create({
                    name: `ticket-${idAuthor}`,
                    type: ChannelType.GuildText,
                    parent: SALON_TICKETS,
                    reason: 'Nouveau ticket créé',
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: ADMIN_ROLE,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                        },
                    ],
                });

                const sentMessage = await ticketChannel.send(`Nouveau ticket de **${message.author.username}** :\n${message.content}${translatedContent}`);
                if (language !== 'fr' && language !== 'unknown') {
                    messageLanguages.set(sentMessage.id, language);
                }
                message.author.send('Bonjour, nous avons bien reçu votre ticket. Un staff vous répondra dans les plus brefs délais.');
            }

        } else {
            if (message.content.startsWith(PREFIX_RESPONSE) || message.content.startsWith(PREFIX_RESPONSE_ANONYME)) {
                const ticketAuthorUsername = message.channel.name.split('-')[1];
                const user = client.users.cache.find(user => user.id === ticketAuthorUsername);

                if (!user) return;

                let reply;
                if (message.content.startsWith(PREFIX_RESPONSE)) {
                    reply = message.content.slice(PREFIX_RESPONSE.length).trim();
                } else if (message.content.startsWith(PREFIX_RESPONSE_ANONYME)) {
                    reply = message.content.slice(PREFIX_RESPONSE_ANONYME.length).trim();
                }

                if (!reply) return;

                const member = guild.members.cache.get(message.author.id);
                const highestRole = member.roles.highest;

                message.delete().catch(console.error);

                // Vérifier si on répond à un message traduit
                if (message.reference) {
                    try {
                        const originalMessage = await message.channel.messages.fetch(message.reference.messageId);
                        const translatedMessage = await message.channel.messages.fetch(message.reference.messageId + 1).catch(() => null);
                        
                        let targetLanguage = messageLanguages.get(originalMessage.id);
                        
                        if (!targetLanguage && translatedMessage) {
                            targetLanguage = messageLanguages.get(translatedMessage.id);
                        }
                        
                        if (targetLanguage && targetLanguage !== 'fr' && targetLanguage !== 'unknown') {
                            const translation = await translateText(reply, targetLanguage);
                            if (translation) {
                                const translatedContent = `\n🔄 Traduction : ${translation}`;
                                
                                // Envoyer le message original et la traduction en DM
                                const dmMessage = message.content.startsWith(PREFIX_RESPONSE) 
                                    ? await user.send(`Réponse de **${message.author.username}** (${highestRole.name}) :\n${reply}${translatedContent}`)
                                    : await user.send(`Réponse d'un ${highestRole.name} :\n${reply}${translatedContent}`);
                                
                                const channelMessage = await message.channel.send(`**${message.author.username}** a répondu :\n${reply}${translatedContent}`);

                                messageLanguages.set(dmMessage.id, targetLanguage);
                                messageLanguages.set(channelMessage.id, targetLanguage);
                                return;
                            }
                        }
                    } catch (error) {
                        console.error('Erreur lors de la traduction de la réponse:', error);
                    }
                }

                // Si ce n'est pas une réponse à un message traduit, détecter la langue normalement
                const language = await detectLanguage(reply);
                let translatedContent = '';
                
                if (language !== 'fr' && language !== 'unknown') {
                    const translation = await translateText(reply, 'fr');
                    if (translation) {
                        translatedContent = `\n🔄 Traduction : ${translation}`;
                    }
                }

                const dmMessage = message.content.startsWith(PREFIX_RESPONSE) 
                    ? await user.send(`Réponse de **${message.author.username}** (${highestRole.name}) :\n${reply}${translatedContent}`)
                    : await user.send(`Réponse d'un ${highestRole.name} :\n${reply}${translatedContent}`);
                
                const channelMessage = await message.channel.send(`**${message.author.username}** a répondu :\n${reply}${translatedContent}`);

                if (language !== 'fr' && language !== 'unknown') {
                    messageLanguages.set(dmMessage.id, language);
                    messageLanguages.set(channelMessage.id, language);
                }
            }
        }
    },
};