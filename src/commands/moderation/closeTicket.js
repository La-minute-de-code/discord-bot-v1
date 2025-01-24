const { SlashCommandBuilder } = require('discord.js');
const {ADMIN_ROLE } = process.env
module.exports = {
    data: new SlashCommandBuilder()
        .setName('modo_close')
        .setDescription('Ferme le ticket actuel')
        .addIntegerOption(option => 
            option.setName('minutes')
                .setDescription('Le nombre de minutes à attendre avant de fermer le ticket')
                .setRequired(true)),
    async execute(interaction) {
        const channel = interaction.channel;
        const member = interaction.member;
        

        if (!member.roles.cache.some(role => role.id === ADMIN_ROLE)) { 
            return interaction.reply({ content: "Désolé, vous n'avez pas la permission de fermer ce ticket.", ephemeral: true });
        }

        const minutes = interaction.options.getInteger('minutes');
        const timeout = minutes ? minutes * 60 * 1000 : deleteTimeout;

        setTimeout(() => channel.delete().catch(console.error), timeout);

        const ticketAuthorUsername = channel.name.split('-')[1];
        const user = interaction.client.users.cache.find(user => user.id === ticketAuthorUsername);

        if (user) {
            minutes === 1 ? 
                user.send(`Votre ticket a été fermé. Il sera supprimé dans ${timeout / 60000} minute.`)
                :
                user.send(`Votre ticket a été fermé. Il sera supprimé dans ${timeout / 60000} minutes.`)
        }

        minutes === 1 ?
            await interaction.reply('Ticket fermé avec succès. Le canal sera supprimé dans ' + (timeout / 60000) + ' minute.')
            :
            await interaction.reply('Ticket fermé avec succès. Le canal sera supprimé dans ' + (timeout / 60000) + ' minutes.')
    },
};