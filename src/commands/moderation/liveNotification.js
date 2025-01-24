const { SlashCommandBuilder } = require('discord.js');
const {  MessageFlags } = require('discord.js');
require('dotenv').config();
const { ADMIN_ROLE, YOUTUBE_ROLE_NOTIFICATION, EVENTS_ROLE_NOTIFICATION,TIKTOK_ROLE_NOTIFICATION } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('live_notification')
        .setDescription('Envoie une notification de live dans le canal actuel'),

    async execute(interaction, client) {
        if (!interaction.member.roles.cache.has(ADMIN_ROLE)) {
            return interaction.reply({ content: "Vous n'avez pas les permissions pour utiliser cette commande.", ephemeral: true });
        }

        const message = `🔴 **NOUS SOMMES EN LIVE !** 🎥\n\n` +
            `<@&${TIKTOK_ROLE_NOTIFICATION}> | <@&${YOUTUBE_ROLE_NOTIFICATION}> | <@&${EVENTS_ROLE_NOTIFICATION}> !\n Une nouvelle aventure commence !\n\n` +
            `🎮 Rejoignez-nous dès maintenant sur :\n` +
            `📺 YouTube : https://www.youtube.com/channel/UCR9yKZuUdmEsC8jt8SFi1LA\n` +
            `💜 Twitch : https://www.twitch.tv/laminutedecode\n` +
            `📱 TikTok : https://www.tiktok.com/@laminutedecode\n\n` +
            `🔥 Ne manquez pas ce moment unique ! On vous attend !`;

        try {
            await interaction.channel.send({ 
                content: message,
                flags: [MessageFlags.SuppressEmbeds]
            });
            await interaction.reply({ content: "Notification de live envoyée avec succès !", ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur s'est produite lors de l'envoi de la notification.", ephemeral: true });
        }
    }
};
