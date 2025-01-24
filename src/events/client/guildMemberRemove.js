const { Events, EmbedBuilder } = require('discord.js');
const { SALON_LOG } = process.env;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function createEmbedBye(user) {
    let dateFormat1 = new Date();

    const msgWelcome = new EmbedBuilder()
        .setColor("#6441a5")
        .setTitle(`Départ d'un membre`)
        .addFields(
            { name: 'Nom', value: `${user.displayName}` },
            { name: 'Username', value: `${user.username}`, inline: false },
            { name: 'Départ du serveur', value: `${dateFormat1}`, inline: false },
        )
        .setTimestamp();
    return msgWelcome;
}

module.exports = {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(member) {
        try {
            await prisma.user.delete({
                where: {
                    id: member.id
                }
            }).catch(() => {
                console.log("L'utilisateur n'était pas dans la base de données");
            });

            const logChannel = member.client.channels.cache.get(SALON_LOG);
            if (logChannel) {
                logChannel.send({ embeds: [createEmbedBye(member.user)] });
            }

            if (member.client.updateMemberCount) await member.client.updateMemberCount();
        } catch (error) {
            console.error('Erreur dans guildMemberRemove:', error);
        }
    }
};
