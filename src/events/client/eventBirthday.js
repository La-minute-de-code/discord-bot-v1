const { Events } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    name: Events.ClientReady,
    once: false,
    async execute(client) {
        console.log('✅ Système d\'anniversaire activé');
        
        setInterval(async () => {
            try {
                const today = new Date();
                const todayFormatted = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
                
                const birthdayUsers = await prisma.user.findMany({
                    where: {
                        birthday: todayFormatted
                    }
                });

                if (birthdayUsers.length > 0) {
                    const chatChannel = client.channels.cache.get(process.env.SALON_CHAT);
                    const logChannel = client.channels.cache.get(process.env.SALON_LOG);
                    
                    for (const user of birthdayUsers) {
                        const guildMember = await client.guilds.cache.first().members.fetch(user.id);
                        
                        if (guildMember) {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: {
                                    exp: {
                                        increment: 500
                                    }
                                }
                            });

                            const message = `🎉 Joyeux Anniversaire ${guildMember} ! 🎂\n\n` +
                                          `Toute l'équipe de La Minute De Code te souhaite une excellente journée ! 🎈\n` +
                                          `Que cette journée soit remplie de joie, de code et de réussite ! 🚀\n\n` +
                                          `🎁 Tu as reçu 500 points d'expérience en cadeau !`;
                            
                            await chatChannel.send(message);

                            if (logChannel) {
                                await logChannel.send(`🎂 ${guildMember} obtient 500 points d'expérience ⭐ pour son anniversaire ! 🎉 🎈 🎁`);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la vérification des anniversaires:', error);
            }
        }, 24 * 60 * 60 * 1000);
    },
};
