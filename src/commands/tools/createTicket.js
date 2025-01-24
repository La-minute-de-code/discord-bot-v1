const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { ADMIN_ROLE, SALON_TICKETS, OPENAI_API_KEY } = process.env;
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

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
    data: new SlashCommandBuilder()
        .setName('createticket')
        .setDescription('Commande pour créer un ticket')
        .addStringOption(option => option
            .setName('iduser')
            .setDescription('Rentrer l\'id de l\'utilisateur')
            .setRequired(true))
        .addStringOption(option => option
            .setName('message')
            .setDescription('Message initial du ticket')
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels),

    async execute(interaction) {
        const idUser = interaction.options.getString('iduser');
        const initialMessage = interaction.options.getString('message');
        const user = await interaction.client.users.fetch(idUser);
        const ticketCategory = interaction.guild.channels.cache.get(SALON_TICKETS);
        
        if (!ticketCategory) {
            await interaction.reply({ content: 'La catégorie des tickets n\'existe pas sur ce serveur. Veuillez vérifier l\'ID dans les variables d\'environnement.', ephemeral: true });
            return;
        }

        const existingTicketChannel = interaction.guild.channels.cache.find(channel => 
            channel.name === `ticket-${idUser}` && channel.parentId === SALON_TICKETS
        );

        if (existingTicketChannel) {
            await interaction.reply(`Ticket déjà existant : ${existingTicketChannel}`);
            return;
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${idUser}`,
            type: ChannelType.GuildText,
            parent: SALON_TICKETS,
            reason: 'Création d\'un ticket',
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: ADMIN_ROLE,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                },
            ],
        });

        let messageContent = `Voici votre nouveau ticket pour contacter : <@${idUser}>`;
        
        if (initialMessage) {
            const language = await detectLanguage(initialMessage);
            let translatedContent = '';
            
            if (language !== 'fr' && language !== 'unknown') {
                const translation = await translateText(initialMessage, 'fr');
                if (translation) {
                    translatedContent = `\n🔄 Traduction : ${translation}`;
                }
            }
            
            messageContent += `\n\nMessage initial : ${initialMessage}${translatedContent}`;
        }

        await ticketChannel.send(messageContent);
        await interaction.reply({ content: `Voici le nouveau ticket : ${ticketChannel}. Il vous permettra de contacter ${user.username}`, ephemeral: true });
    },
};

