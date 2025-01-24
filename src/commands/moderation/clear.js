const { SlashCommandBuilder } = require('discord.js');
const { ADMIN_ROLE } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modo_clear')
        .setDescription('Efface un nombre spécifié de messages dans le canal')
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Le nombre de messages à effacer')
                .setRequired(true)),
    async execute(interaction, client) {

        if (!interaction.member.roles.cache.has(ADMIN_ROLE)) {
            await interaction.reply('Vous n\'avez pas la permission d\'utiliser cette commande.');
            return;
        }

        const nombreMessages = interaction.options.getInteger('nombre');

  
        if (nombreMessages < 1 || nombreMessages > 100) {
            await interaction.reply('Le nombre de messages à effacer doit être compris entre 1 et 100.');
            return;
        }

        try {
            const messages = await interaction.channel.messages.fetch({ limit: nombreMessages });
            await interaction.channel.bulkDelete(messages);
            await interaction.reply(`Les ${nombreMessages} derniers messages ont été effacés.`);
        } catch (error) {
            console.error('Une erreur s\'est produite lors de la suppression des messages:', error);
            await interaction.reply('Une erreur s\'est produite lors de la suppression des messages.');
        }
    },
};
