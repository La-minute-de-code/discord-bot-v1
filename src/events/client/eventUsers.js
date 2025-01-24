const { Events } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        try {

            const guild = client.guilds.cache.first();
            if (guild) {
                const members = await guild.members.fetch();
                console.log(`Début de la synchronisation de ${members.size} membres...`);
                
                for (const [id, member] of members) {
                    await saveUserData(member);
                }
                console.log('Synchronisation initiale terminée!');
            }

            // Configuration de l'événement pour les nouveaux membres
            client.on(Events.GuildMemberAdd, async (member) => {
                try {
                    await saveUserData(member);
                } catch (error) {
                    console.error('Erreur lors de l\'enregistrement du nouvel utilisateur:', error);
                }
            });

        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
        }
    },
};

async function saveUserData(member) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
        where: { id: member.user.id }
    });


    if (!existingUser) {
        const userRoles = member.roles.cache.map(role => role.name).join(',');
        
        await prisma.user.create({
            data: {
                id: member.user.id,
                username: member.user.username,
                roles: userRoles,
                points_challenge: 0
            }
        });
        
        console.log(`Nouvel utilisateur ${member.user.username} enregistré dans la base de données`);
    }
}
