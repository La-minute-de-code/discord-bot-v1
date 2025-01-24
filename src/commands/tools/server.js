const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function createEmbed(guild, user) {
    const serverInfosEmbed = new EmbedBuilder()
        .setColor("#4D177C")
        .setTitle(`Information du serveur`)
        .setURL('https://discord.laminutedecode.io')
        .setThumbnail('https://cdn.discordapp.com/attachments/1072083933115731968/1072132640536281128/Dark.png')
        .addFields(
            {name: 'Nom du server', value: `${guild.name}`},
            {name: 'Description du serveur', value: `${guild.description}`, inline: false},
            {name: 'Nombre de membres', value: `${guild.memberCount}`, inline: true},
            {name: 'Création du serveur', value: `${guild.createdAt.toLocaleString()}`, inline: true},
        )
        .setTimestamp()
        .setFooter({text: user.username, iconURL: user.avatarURL()});

    return serverInfosEmbed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Informations à propos du serveur'),
    async execute(interaction) {
        await interaction.reply({embeds: [createEmbed(interaction.guild, interaction.user)], ephemeral: true});
    },
};