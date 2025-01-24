const { SALON_BOITEAIDEES } = process.env;
const { EmbedBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    data: {
        name: 'Modal-idea'
    },
    async execute(interaction) {
        const inputText = interaction.fields.getTextInputValue('inputTextModalIdea');
  
        
        try {
            const salonIdees = interaction.guild.channels.cache.get(SALON_BOITEAIDEES);
            const logChannel = interaction.guild.channels.cache.get(process.env.SALON_LOG);
            
            if (!salonIdees) {
                return await interaction.reply({ 
                    content: "Le salon des idées n'a pas été trouvé.", 
                    ephemeral: true 
                });
            }

            // Vérifier si l'utilisateur existe dans la base de données
            const user = await prisma.user.findUnique({
                where: { id: interaction.user.id }
            });

            if (user) {
                // Ajouter les points d'expérience
                await prisma.user.update({
                    where: { id: interaction.user.id },
                    data: {
                        exp: { increment: 100 }
                    }
                });

                // Envoyer le message dans le salon de logs
                if (logChannel) {
                    logChannel.send(`📝 ${interaction.user} a reçu 100 points d'expérience pour avoir proposé une idée dans ${salonIdees}`);
                }
            }

            const embedIdee = new EmbedBuilder()
                .setColor('#4D177C')
                .setTitle('💡 Nouvelle idée de tutoriel')
                .setDescription(inputText)
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()
                .setFooter({ 
                    text: 'Votez avec les réactions ci-dessous !' 
                });

            const messageEmbed = await salonIdees.send({ embeds: [embedIdee] });
            
            await messageEmbed.react('✅'); 
            await messageEmbed.react('❌'); 

            await interaction.reply({ 
                content: "Votre idée a été publiée dans le salon des idées !", 
                ephemeral: true 
            });

        } catch (error) {
            console.error("Erreur lors de la création de l'idée: ", error);
            await interaction.reply({ 
                content: "Une erreur est survenue lors de la publication de votre idée.", 
                ephemeral: true 
            });
        }
    }
};