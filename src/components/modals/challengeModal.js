const { EmbedBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {CHALLENGE_ROLE, MEMBERS_ROLE  } = process.env;

module.exports = {
    data: {
        name: 'Modal-challenge'
    },
    async execute(interaction) {
        const inputText = interaction.fields.getTextInputValue('inputTextChallenge');
        
        try {
            const activeChallenge = await prisma.challenge.findFirst({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' }
            });

            if (!activeChallenge) {
                return await interaction.reply({ 
                    content: "Aucun challenge actif n'a été trouvé.", 
                    ephemeral: true 
                });
            }

            const existingSubmission = await prisma.challengeSubmission.findFirst({
                where: {
                    userId: interaction.user.id,
                    challengeId: activeChallenge.id
                }
            });

            if (existingSubmission) {
                return await interaction.reply({
                    content: "Vous avez déjà soumis une proposition pour ce challenge !",
                    ephemeral: true
                });
            }

            const salonChallengeVote = interaction.guild.channels.cache.get(process.env.SALON_VOTE_CHALLENGE);
            const logChannel = interaction.guild.channels.cache.get(process.env.SALON_LOG);
            const chatChannel = interaction.guild.channels.cache.get(process.env.SALON_CHAT);

            await prisma.challengeSubmission.create({
                data: {
                    userId: interaction.user.id,
                    challengeId: activeChallenge.id,
                    content: inputText,
                    votes: 0
                }
            });

            await prisma.user.update({
                where: { id: interaction.user.id },
                data: {
                    points_challenge: { increment: 50 }
                }
            });

            if (logChannel) {
                logChannel.send(`📝 ${interaction.user} a reçu 50 points de participation pour avoir soumis une proposition de challenge dans ${salonChallengeVote}`);
            }
            
            if (!salonChallengeVote) {
                return await interaction.reply({ 
                    content: "Le salon challenge n'a pas été trouvé.", 
                    ephemeral: true 
                });
            }

            const dateFormatted = activeChallenge.dateLimite.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const embedChallenge = new EmbedBuilder()
                .setColor('#4D177C')
                .setTitle('🎨 Nouvelle Proposition')
                .setDescription(`Une nouvelle proposition a été soumise !\n\n${inputText}`)
                .addFields(
                    { 
                        name: '📋 Thème', 
                        value: `\`\`\`${activeChallenge.theme}\`\`\``,
                        inline: true 
                    },
                    { 
                        name: '⏰ Date limite', 
                        value: `\`\`\`${dateFormatted}\`\`\``,
                        inline: true 
                    },
                    { 
                        name: '👤 Challenger', 
                        value: `<@${interaction.user.id}>`,
                        inline: false 
                    }
                )
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()
                .setFooter({ 
                    text: '💫 Votez pour votre proposition préférée !' 
                });

            const messageEmbed = await salonChallengeVote.send({ 
                content: `<@&${CHALLENGE_ROLE}>`,
                embeds: [embedChallenge] 
            });
            
            await messageEmbed.react('🔥');

            if (chatChannel) {
                await chatChannel.send(`<@&${MEMBERS_ROLE}> <@&${CHALLENGE_ROLE}> ${interaction.user.username} a soumis une proposition pour le challenge front-end, n'hésitez pas à le soutenir en votant pour son projet via la réaction 🔥 dans ${salonChallengeVote}`);
            }

            await interaction.reply({ 
                content: "✅ Votre projet a été soumis avec succès ! +50 points de participation !", 
                ephemeral: true 
            });

        } catch (error) {
            console.error("Erreur lors de la création: ", error);
            await interaction.reply({ 
                content: "Une erreur est survenue lors de la publication.", 
                ephemeral: true 
            });
        }
    }
};