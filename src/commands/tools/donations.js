const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donation')
        .setDescription('Faire un don pour soutenir le projet'),
    
    async execute(interaction) {
        await interaction.reply({
            content: '💖 Merci de vouloir soutenir le projet !\n' +
                     '🔗 Voici le lien pour faire un don : https://buymeacoffee.com/lmdc',
            ephemeral: true // Le message sera visible uniquement par l'utilisateur qui a utilisé la commande
        });
    }
};
