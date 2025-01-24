const { 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');

console.log('✅ Bouton de challenge initialisé');

module.exports = {
    data: {
        name: 'challenge_button'
    },
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('Modal-challenge')
            .setTitle('💡 Proposer votre projet pour le challenge');

        const projetInput = new TextInputBuilder()
            .setCustomId('inputTextChallenge')
            .setLabel('Décrivez votre projet')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Décrivez votre projet en détail...')
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(1000);

        const firstActionRow = new ActionRowBuilder().addComponents(projetInput);
        modal.addComponents(firstActionRow);

        try {
            await interaction.showModal(modal);
        } catch (error) {
            await interaction.reply({
                content: 'Une erreur est survenue lors de l\'ouverture du formulaire.',
                ephemeral: true
            });
        }
    }
}; 