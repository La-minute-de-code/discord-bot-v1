const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('Démarrer un quiz')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choisissez le type de quiz')
                .setRequired(true)
                .addChoices(
                    { name: 'CSS', value: 'CSS' },
                    { name: 'HTML', value: 'HTML' },
                    { name: 'JavaScript', value: 'Javascript' },
                    { name: 'Laravel', value: 'Laravel' },
                    { name: 'Next.js', value: 'Next' },
                    { name: 'PHP', value: 'PHP' },
                    { name: 'React', value: 'React' },
                    { name: 'Sass et Scss', value: 'SASS' },
                    { name: 'Symfony', value: 'Symfony' },
                    { name: 'Angular', value: 'Angular' },
                    { name: 'Vuejs', value: 'Vuejs' },
                    { name: 'ShellBash', value: 'ShellBash' },
                    { name: 'Linux', value: 'Linux' },
                    { name: 'Python', value: 'Python' },
                    { name: 'Csharp', value: 'Csharp' },
                    { name: 'Webdesign', value: 'Webdesign' },
                    { name: 'SQL', value: 'SQL' },
                    { name: 'Java', value: 'Java' },
                    { name: 'Ruby', value: 'Ruby' },
                    { name: 'Nestjs', value: 'Nestjs' },
                    { name: 'Figma', value: 'Figma' }
                )),

    async execute(interaction) {
        const quizType = interaction.options.getString('type');
        let quizData;

        try {
            const quizPath = path.join(__dirname, `../../../quizs/quiz${quizType}.json`);
            quizData = require(quizPath);
        } catch (error) {
            return await interaction.reply({ 
                content: "Désolé, ce quiz n'est pas disponible pour le moment.", 
                ephemeral: true 
            });
        }

        const questions = quizData.questions;
        const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
        let score = 0;
        let currentQuestion = 0;
        const endTime = Date.now() + 240000; // 4 minutes

        while (currentQuestion < shuffledQuestions.length) {
            const question = shuffledQuestions[currentQuestion];
            const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
            const correctAnswerIndex = shuffledOptions.indexOf(question.options[question.answer]);
            const remaining = Math.max(0, endTime - Date.now());

            if (remaining <= 0) {
                await interaction.editReply({
                    content: 'Temps écoulé ! Le quiz est terminé.',
                    components: [],
                    embeds: []
                });
                return;
            }

            const questionEmbed = new EmbedBuilder()
                .setColor('#4D177C')
                .setTitle(`Question ${currentQuestion + 1}/${shuffledQuestions.length}`)
                .setDescription(`${question.question}\n\n${shuffledOptions.map((option, index) => `${index + 1}. ${option}`).join('\n')}`)
                .setFooter({ text: `⏱️ Temps restant: ${Math.floor(remaining / 60000)}:${Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0')}` });

            const row = new ActionRowBuilder()
                .addComponents(
                    shuffledOptions.map((option, index) => 
                        new ButtonBuilder()
                            .setCustomId(`option_${index}`)
                            .setLabel(`Choix ${index + 1}`)
                            .setStyle(ButtonStyle.Primary)
                    )
                );

            if (currentQuestion === 0) {
                await interaction.reply({ embeds: [questionEmbed], components: [row] });
            } else {
                await interaction.editReply({ embeds: [questionEmbed], components: [row] });
            }

            const updateTimer = setInterval(() => {
                const remaining = Math.max(0, endTime - Date.now());
                if (remaining <= 0) {
                    clearInterval(updateTimer);
                    interaction.editReply({
                        content: 'Temps écoulé ! Le quiz est terminé.',
                        components: [],
                        embeds: []
                    });
                    return;
                }

                const updatedEmbed = EmbedBuilder.from(questionEmbed)
                    .setFooter({ text: `⏱️ Temps restant: ${Math.floor(remaining / 60000)}:${Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0')}` });

                interaction.editReply({
                    embeds: [updatedEmbed],
                    components: [row]
                }).catch(() => clearInterval(updateTimer));
            }, 1000);

            try {
                const response = await interaction.channel.awaitMessageComponent({
                    filter: i => i.user.id === interaction.user.id && i.customId.startsWith('option_'),
                    time: remaining
                });

                clearInterval(updateTimer);

                const answer = parseInt(response.customId.split('_')[1]);
                const isCorrect = answer === correctAnswerIndex;
                if (isCorrect) score++;

                const updatedRow = new ActionRowBuilder()
                    .addComponents(
                        shuffledOptions.map((option, index) => 
                            new ButtonBuilder()
                                .setCustomId(`option_${index}`)
                                .setLabel(`Choix ${index + 1}`)
                                .setStyle(
                                    index === correctAnswerIndex ? ButtonStyle.Success :
                                    index === answer && !isCorrect ? ButtonStyle.Danger :
                                    ButtonStyle.Secondary
                                )
                                .setDisabled(true)
                        )
                    );

                await response.update({ 
                    embeds: [questionEmbed], 
                    components: [updatedRow] 
                });
                await new Promise(resolve => setTimeout(resolve, 2000));

                currentQuestion++;

            } catch (error) {
                clearInterval(updateTimer);
                return await interaction.editReply({
                    content: 'Temps écoulé pour cette question !',
                    components: [],
                    embeds: []
                });
            }
        }

        await interaction.deleteReply();

        const percentage = Math.round((score/shuffledQuestions.length) * 100);
        const resultEmbed = new EmbedBuilder()
            .setColor('#4D177C')
            .setTitle(`Résultat du Quiz ${quizData.quizName}`)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(`Score final: ${score}/${shuffledQuestions.length} (${percentage}%)`)
            .addFields(
                { name: 'Nombre de questions', value: `${shuffledQuestions.length}`, inline: true },
                { name: 'Réponses correctes', value: `${score}`, inline: true },
                { name: 'Pourcentage', value: `${percentage}%`, inline: true },
                { name: 'Récompense', value: `+100 points EXP si votre résultat est supérieur à 80%`, inline: false },
                { name: 'Informations', value: `Retrouver vos résultats sur votre carte de profil que vous pouvez afficher avec la commande /user dans le salon <#${process.env.SALON_COMMANDES}>`, inline: false },
            )
            .setTimestamp();

        try {
            await prisma.user.update({
                where: { id: interaction.user.id },
                data: {
                    count_quiz_Success: percentage >= 80 ? { increment: 1 } : undefined,
                    count_quiz_Fail: percentage < 80 ? { increment: 1 } : undefined,
                    exp: percentage >= 80 ? { increment: 100 } : undefined
                }
            });

            await prisma.quiz.create({
                data: {
                    nb_response_success: score,
                    nb_response_fail: shuffledQuestions.length - score,
                    note: percentage,
                    userId: interaction.user.id
                }
            });

            if (percentage >= 80) {
                const logChannel = interaction.client.channels.cache.get(process.env.SALON_LOG);
                if (logChannel) {
                    logChannel.send(`📝 ${interaction.user} a reçu 100 points d'expérience pour avoir réussi le quiz ${quizData.quizName} avec un score de ${percentage}%`);
                }
            }

            await interaction.channel.send({ 
                content: `Résultats du ${quizData.quizName} de ${interaction.user}:`,
                embeds: [resultEmbed] 
            });

        } catch (error) {
            console.error("Erreur lors de la mise à jour des statistiques:", error);
        }
    },
}; 