const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    name: 'eventQuizs',
    once: true,
    async execute(client) {
        console.log('Quiz Event Handler démarré');

        const checkEmbeds = async () => {
            try {
                const recentQuizzes = await prisma.quiz.findMany({
                    where: {
                        createdAt: {
                            gte: new Date(Date.now() - 5 * 60 * 1000) // 5 dernières minutes
                        }
                    }
                });

                const quizChannel = client.channels.cache.get(process.env.SALON_QUIZ);
                if (quizChannel && quizChannel.isTextBased()) {
                    const messages = await quizChannel.messages.fetch({ limit: 100 });
                    
                    for (const quiz of recentQuizzes) {
                        const createdAt = new Date(quiz.createdAt);
                        const now = new Date();
                        const threeMinutesInMs = 3 * 60 * 1000;

                        if (now - createdAt >= threeMinutesInMs) {
                            for (const message of messages.values()) {
                                if (message.embeds.length > 0 && 
                                    message.embeds[0].title?.includes('Résultat du Quiz')) {

                                    if (message.createdTimestamp >= createdAt.getTime() &&
                                        message.createdTimestamp <= createdAt.getTime() + 5000) {
                                        try {
                                            await message.delete();
                                        } catch (error) {
                                            if (error.code !== 10008) {
                                                console.error('Erreur lors de la suppression:', error);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Erreur dans le Quiz Event Handler:', error);
            }
        };

        setInterval(checkEmbeds, 30000);
        await checkEmbeds();
    }
};
