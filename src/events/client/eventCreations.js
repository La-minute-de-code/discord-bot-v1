const { Events } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('✅ Système de créations activé');

module.exports = {
    name: Events.ThreadCreate,
    once: false,
    async execute(thread) {
        try {
            if (thread.parent?.id === process.env.SALON_CREATION) {
                const logChannel = thread.client.channels.cache.get(process.env.SALON_LOG);
                if (!logChannel) return;

                const user = await prisma.user.findUnique({
                    where: { id: thread.ownerId }
                });

                if (!user) return;

                await prisma.user.update({
                    where: { id: thread.ownerId },
                    data: {
                        exp: { increment: 100 }
                    }
                });
                
                logChannel.send(`📝 <@${thread.ownerId}> a reçu 100 points d'expérience pour avoir partagé sa création "${thread.name}" dans ${thread.parent}`);
            }
        } catch (error) {
            console.error('Erreur lors de la gestion de l\'expérience de création:', error);
        }
    }
};
