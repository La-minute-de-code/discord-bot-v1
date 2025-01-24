const { Events } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                return;
            }
        }

        if (user.bot) return;

        try {
            if (reaction.message.embeds.length > 0 && 
                reaction.message.embeds[0].title === '🎨 Nouvelle Proposition') {
                
                const challengerField = reaction.message.embeds[0].fields.find(f => f.name === '👤 Challenger');
                if (!challengerField) return;

                const challengerId = challengerField.value.replace(/[<@>]/g, '');
                
                const activeChallenge = await prisma.challenge.findFirst({
                    where: { isActive: true }
                });

                if (!activeChallenge) return;

                const submission = await prisma.challengeSubmission.findFirst({
                    where: {
                        userId: challengerId,
                        challengeId: activeChallenge.id
                    }
                });

                if (!submission) return;

                if (reaction.emoji.name === '🔥') {
                    const fireReaction = reaction.message.reactions.cache.get('🔥');
                    const totalVotes = fireReaction ? fireReaction.count - 1 : 0;

                    await prisma.challengeSubmission.update({
                        where: { id: submission.id },
                        data: { votes: totalVotes }
                    });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la gestion des votes challenge:', error);
        }
    }
};

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                return;
            }
        }

        if (user.bot) return;

        try {
            if (reaction.message.embeds.length > 0 && 
                reaction.message.embeds[0].title === '🎨 Nouvelle Proposition') {
                
                const challengerField = reaction.message.embeds[0].fields.find(f => f.name === '👤 Challenger');
                if (!challengerField) return;

                const challengerId = challengerField.value.replace(/[<@>]/g, '');
                
                const activeChallenge = await prisma.challenge.findFirst({
                    where: { isActive: true }
                });

                if (!activeChallenge) return;

                const submission = await prisma.challengeSubmission.findFirst({
                    where: {
                        userId: challengerId,
                        challengeId: activeChallenge.id
                    }
                });

                if (!submission) return;

                if (reaction.emoji.name === '🔥') {
                    const fireReaction = reaction.message.reactions.cache.get('🔥');
                    const totalVotes = fireReaction ? fireReaction.count - 1 : 0;

                    await prisma.challengeSubmission.update({
                        where: { id: submission.id },
                        data: { votes: totalVotes }
                    });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la gestion du retrait des votes challenge:', error);
        }
    }
}; 