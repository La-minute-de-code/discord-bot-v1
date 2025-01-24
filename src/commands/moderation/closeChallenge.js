const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { CHALLENGE_ROLE, SALON_LOG, ADMIN_ROLE } = process.env;

console.log('✅ Commande de clôture du challenge initialisée');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modo_close_challenge')
        .setDescription('Terminer le challenge en cours')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(ADMIN_ROLE)) {
            return interaction.reply({
                content: "❌ Vous n'avez pas la permission d'utiliser cette commande. Elle est réservée aux administrateurs.",
                ephemeral: true
            });
        }

        try {
            const activeChallenge = await prisma.challenge.findFirst({
                where: {
                    isActive: true
                },
                include: {
                    submissions: {
                        include: {
                            user: true
                        },
                        orderBy: {
                            votes: 'desc'
                        }
                    }
                }
            });

            if (!activeChallenge) {
                return await interaction.reply({ content: "Aucun challenge actif n'a été trouvé.", ephemeral: true });
            }

            const rewards = [200, 150, 100];
            const submissions = activeChallenge.submissions;
            
            if (submissions.length === 0) {
                return await interaction.reply({ content: "Aucune participation n'a été enregistrée pour ce challenge.", ephemeral: true });
            }

            const allParticipants = [];
            const logChannel = interaction.client.channels.cache.get(SALON_LOG);
            
            for (let i = 0; i < submissions.length; i++) {
                const submission = submissions[i];
                
                if (i < 3) {
                    try {
                        await prisma.user.update({
                            where: { id: submission.userId },
                            data: {
                                points_challenge: {
                                    increment: rewards[i]
                                }
                            }
                        });

                        if (logChannel) {
                            const position = i === 0 ? "premier" : i === 1 ? "deuxième" : "troisième";
                            await logChannel.send(`🏆 <@${submission.userId}> obtient ${rewards[i]} points pour avoir terminé ${position} du challenge front-end dans <#${process.env.SALON_CHALLENGE}>`);
                        }
                    } catch (error) {
                        console.error(`Erreur lors de la mise à jour des points pour ${submission.user.username}:`, error);
                    }
                }

                allParticipants.push({
                    username: submission.user.username,
                    points: i < 3 ? rewards[i] : 0,
                    votes: submission.votes,
                    position: i + 1
                });
            }

            const resultsEmbed = new EmbedBuilder()
                .setColor('#4D177C')
                .setTitle('🏆 Résultats du Challenge')
                .setDescription(`Le challenge **${activeChallenge.theme}** est terminé ! Voici le classement complet :`)
                .setTimestamp()
                .setFooter({ text: 'Félicitations à tous les participants !' });

            const podium = allParticipants.slice(0, 3);
            if (podium.length > 0) {
                resultsEmbed.addFields({
                    name: '🏆 Podium',
                    value: podium.map(winner => 
                        `${winner.position === 1 ? '🥇' : winner.position === 2 ? '🥈' : '🥉'} **${winner.username}**\n` +
                        `💫 Points gagnés: \`+${winner.points}\``
                    ).join('\n\n'),
                    inline: false
                });
            }

            const otherParticipants = allParticipants.slice(3);
            if (otherParticipants.length > 0) {
                resultsEmbed.addFields({
                    name: '📊 Autres Participants',
                    value: otherParticipants.map(participant =>
                        `**${participant.position}.** ${participant.username} - \`${participant.votes}\` votes`
                    ).join('\n'),
                    inline: false
                });
            }

            const classementChannel = interaction.client.channels.cache.get(process.env.SALON_CLASSEMENT_CHALLENGE);
            if (classementChannel) {
                await classementChannel.send({ 
                    content: `<@&${CHALLENGE_ROLE}>\n🎉 Félicitations à tous les participants pour leur créativité et leur engagement dans ce challenge ! Voici les résultats :`,
                    embeds: [resultsEmbed] 
                });
            }

            await prisma.challenge.update({
                where: { id: activeChallenge.id },
                data: { isActive: false }
            });

            await interaction.reply({ content: "Le challenge a été clôturé avec succès et les points ont été distribués !", ephemeral: true });

        } catch (error) {
            console.error('Erreur lors de la clôture du challenge:', error);
            await interaction.reply({ content: "Une erreur est survenue lors de la clôture du challenge.", ephemeral: true });
        }
    }
};
