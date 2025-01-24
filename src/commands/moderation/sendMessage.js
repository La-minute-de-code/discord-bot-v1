const { SlashCommandBuilder } = require('discord.js');
const { Permissions } = require('discord.js');
require('dotenv').config();
const { ADMIN_ROLE } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modo_send')
        .setDescription('Envoie un message dans un canal spécifié')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message à envoyer')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Le canal où envoyer le message')
                .setRequired(true)),

    async execute(interaction, client){
        let message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel');
        

        if (!interaction.member.roles.cache.has(ADMIN_ROLE)) {
            return interaction.reply({ content: "Vous n'avez pas les permissions pour utiliser cette commande.", ephemeral: true });
        }

        message = message.replace(/\\n/g, '\n');


        try {
            await channel.send(message);
            await interaction.reply({ content: `Message envoyé dans ${channel.name}`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Une erreur s'est produite lors de l'envoi du message.", ephemeral: true });
        }
    }
};
