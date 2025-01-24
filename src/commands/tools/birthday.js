const { SlashCommandBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('Définir votre date d\'anniversaire')
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Votre date d\'anniversaire (format: DD/MM)')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const date = interaction.options.getString('date');
            
            // Vérifier le format de la date (DD/MM)
            if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/.test(date)) {
                return interaction.reply({ 
                    content: '❌ Format de date invalide. Utilisez le format DD/MM (exemple: 25/12)', 
                    ephemeral: true 
                });
            }

            await prisma.user.update({
                where: { id: interaction.user.id },
                data: { birthday: date }
            });

            await interaction.reply({ 
                content: `✅ Votre date d'anniversaire a été définie au ${date}!`,
                ephemeral: true 
            });
        } catch (error) {
            console.error('Erreur lors de la définition de la date d\'anniversaire:', error);
            await interaction.reply({ 
                content: '❌ Une erreur est survenue lors de la définition de votre date d\'anniversaire.',
                ephemeral: true 
            });
        }
    },
}; 