const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createEmbed(user, member, inter) {

    const userData = await prisma.user.findUnique({
        where: { id: user.id }
    });

    const totalQuiz = (userData?.count_quiz_Success || 0) + (userData?.count_quiz_Fail || 0);
    const winRate = totalQuiz > 0 
        ? Math.round((userData?.count_quiz_Success / totalQuiz) * 100) 
        : 0;

    const userEmbed = new EmbedBuilder()
        .setColor("#4D177C")
        .setTitle(`📋 Profil de ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
        .addFields(
            { 
                name: '📅 Informations générales',
                value: `**Création du compte:** ${user.createdAt.toLocaleString()}\n**A rejoint le serveur:** ${member.joinedAt.toLocaleString()}`,
                inline: false 
            },
            {
                name: '🏆 Points & Expérience',
                value: `**Points Challenge:** ${userData?.points_challenge || 0}\n**Points EXP:** ${userData?.exp || 0}`,
                inline: false
            },
            {
                name: '📊 Statistiques Quiz',
                value: `**Total:** ${totalQuiz} quiz\n` +
                    `**Réussis:** ${userData?.count_quiz_Success || 0} ✅\n` +
                    `**Échoués:** ${userData?.count_quiz_Fail || 0} ❌\n` +
                    `**Taux de réussite:** ${winRate}%`,
                inline: false
            },
            {
                name: '🎭 Rôles',
                value: member.roles.cache.map(role => role.name).join(', '),
                inline: false
            },
        )
        .setDescription('**Voici votre carte de profil**')
        .setTimestamp()
        .setFooter({ 
            text: `Demandé par ${inter.username}`, 
            iconURL: inter.avatarURL() 
        });

    return userEmbed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription("Afficher carte profil d'un membre")
        .addUserOption(option => 
            option.setName('user')
                .setDescription('L\'utilisateur à rechercher')
                .setRequired(true)),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            
            const user = interaction.options.getUser('user');
            const member = interaction.guild.members.cache.get(user.id);
            
            const embed = await createEmbed(user, member, interaction.user);
            await interaction.editReply({ 
                embeds: [embed],
                ephemeral: true
            });
            
        } catch (error) {
            console.error('Erreur dans la commande user:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: "Une erreur s'est produite lors de l'exécution de la commande.", 
                    ephemeral: true 
                });
            }
        }
    },
};