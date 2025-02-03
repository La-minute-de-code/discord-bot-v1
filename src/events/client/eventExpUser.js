const { Events } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;

        try {
            const logChannel = message.client.channels.cache.get(process.env.SALON_LOG);
            if (!logChannel) {
                console.error('Le salon de logs n\'a pas été trouvé');
                return;
            }

            let user = await prisma.user.findUnique({
                where: { id: message.author.id }
            });

            if (!user) return;

            // Vérification quotidienne
            const now = new Date();
            const lastDaily = user.lastDailyExp ? new Date(user.lastDailyExp) : new Date(0);
            
            if (now.getDate() !== lastDaily.getDate() || now.getMonth() !== lastDaily.getMonth()) {
                user = await prisma.user.update({
                    where: { id: message.author.id },
                    data: {
                        exp: { increment: 100 },
                        lastDailyExp: now
                    }
                });

                logChannel.send(`📝 ${message.author} a reçu 100 points d'expérience pour sa fidélité quotidienne dans ${message.channel}`);
            }

            const newMessageCount = (user.messageCount || 0) + 1;
            if (newMessageCount >= 20) {
                await prisma.user.update({
                    where: { id: message.author.id },
                    data: {
                        exp: { increment: 50 },
                        messageCount: 0
                    }
                });

                logChannel.send(`📝 ${message.author} a reçu 50 points d'expérience pour sa participation active (20 messages) dans ${message.channel}`);
            } else {
                await prisma.user.update({
                    where: { id: message.author.id },
                    data: { messageCount: newMessageCount }
                });
            }


            if (message.channel.parent?.parent?.id === process.env.HELP_CATEGORY && 
                message.member.roles.cache.has(process.env.HELPEURS_ROLE)) {
                
                const thread = message.channel;
                
                if (thread.ownerId !== message.author.id) {
                    const hasReceivedPoints = await prisma.threadReward.findFirst({
                        where: {
                            threadId: thread.id,
                            userId: message.author.id
                        }
                    });

                    if (!hasReceivedPoints) {
                        await prisma.user.update({
                            where: { id: message.author.id },
                            data: {
                                exp: { increment: 100 }
                            }
                        });

                        await prisma.threadReward.create({
                            data: {
                                threadId: thread.id,
                                userId: message.author.id
                            }
                        });

                        logChannel.send(`📝 ${message.author} a reçu 100 points d'expérience pour avoir aidé dans le post ${thread.name}`);
                    }
                }
            }

            
            if (message.channel.id === process.env.SALON_OUTILS) {
                const urlRegex = /(https?:\/\/[^\s]+)/g;
                if (urlRegex.test(message.content)) {
                    await prisma.user.update({
                        where: { id: message.author.id },
                        data: {
                            exp: { increment: 50 }
                        }
                    });
                    logChannel.send(`📝 ${message.author} a reçu 50 points d'expérience pour avoir partagé une ressource dans ${message.channel}`);
                }
            }

   
            if (message.channel.id === process.env.SALON_GITHUB) {
                const githubRegex = /https?:\/\/(?:www\.)?github\.com\/[^\s]+/g;
                if (githubRegex.test(message.content)) {
                    await prisma.user.update({
                        where: { id: message.author.id },
                        data: {
                            exp: { increment: 100 }
                        }
                    });
                    logChannel.send(`📝 ${message.author} a reçu 100 points d'expérience pour avoir partagé son compte GitHub dans ${message.channel}`);
                }
            }

        } catch (error) {
            console.error('Erreur lors de la gestion de l\'expérience:', error);
        }
    }
};
