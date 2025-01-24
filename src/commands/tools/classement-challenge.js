const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('classement_challenge')
        .setDescription('Affiche le classement des utilisateurs par points de challenge'),

    async execute(interaction) {
        await interaction.deferReply();

        let currentPage = 1;
        const usersPerPage = 10;

        async function generateEmbed(pageNumber) {
            const skip = (pageNumber - 1) * usersPerPage;

            // Compter uniquement les utilisateurs avec le rôle challenger
            const totalUsers = await prisma.user.count({
                where: {
                    roles: {
                        contains: 'challenge'
                    }
                }
            });

            const totalPages = Math.ceil(totalUsers / usersPerPage);

            // Récupérer les utilisateurs filtrés et triés
            const users = await prisma.user.findMany({
                where: {
                    roles: {
                        contains: 'challenge'
                    }
                },
                skip: skip,
                take: usersPerPage,
                orderBy: {
                    points_challenge: 'desc'
                }
            });

            const embed = new EmbedBuilder()
                .setTitle('🎯 Classement Challenge')
                .setColor('#4D177C')
                .setDescription(
                    users.map((user, index) => {
                        const position = skip + index + 1;
                        const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '▫️';
                        return `${medal} **#${position}** - ${user.username}\n▸ Points: ${user.points_challenge.toLocaleString()} points`;
                    }).join('\n\n')
                )
                .setFooter({ text: `Page ${pageNumber}/${totalPages} • ${totalUsers} challengers au total` })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('◀️ Précédent')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(pageNumber === 1),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Suivant ▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(pageNumber === totalPages)
                );

            return { embed, row, totalPages };
        }

        const { embed, row, totalPages } = await generateEmbed(currentPage);
        const message = await interaction.editReply({
            embeds: [embed],
            components: [row]
        });

        // Créer le collecteur de boutons
        const collector = message.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000 // Le collecteur expire après 1 minute
        });

        collector.on('collect', async i => {
            if (i.customId === 'previous' && currentPage > 1) {
                currentPage--;
            } else if (i.customId === 'next' && currentPage < totalPages) {
                currentPage++;
            }

            const { embed: newEmbed, row: newRow } = await generateEmbed(currentPage);
            await i.update({
                embeds: [newEmbed],
                components: [newRow]
            });
        });

        collector.on('end', () => {
            // Désactiver les boutons une fois le temps écoulé
            row.components.forEach(button => button.setDisabled(true));
            message.edit({ components: [row] }).catch(() => {});
        });
    },
}; 