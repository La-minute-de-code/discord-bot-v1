const { 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');
const { PrismaClient } = require('@prisma/client');

const { ADMIN_ROLE, SALON_REGLE_CHALLENGE, SALON_EVENTS, SALON_CHALLENGE, CHALLENGE_ROLE } = process.env;
const prisma = new PrismaClient();

module.exports = {
  data: new SlashCommandBuilder()
      .setName('modo_start_challenge')
      .setDescription('Soumettre votre propositions pour le challenge')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addStringOption(option => 
          option
              .setName('theme')
              .setDescription('Le thème du challenge')
              .setRequired(true)
      ),

  async execute(interaction, client) {
      if (!interaction.member.roles.cache.has(ADMIN_ROLE)) {
          return interaction.reply({
              content: "❌ Vous n'avez pas la permission d'utiliser cette commande. Elle est réservée aux administrateurs.",
              ephemeral: true
          });
      }

      await interaction.deferReply();

      const theme = interaction.options.getString('theme');
      
      const dateLimite = new Date();
      dateLimite.setDate(dateLimite.getDate() + 7);

      // Avant de créer le nouveau challenge
      await prisma.challenge.updateMany({
          where: { isActive: true },
          data: { isActive: false }
      });

      // Sauvegarder le nouveau challenge en BDD
      await prisma.challenge.create({
          data: {
              theme,
              dateLimite,
              isActive: true
          }
      });

      const dateFormatted = dateLimite.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
      });

      const embed = new EmbedBuilder()
          .setColor('#4D177C')
          .setTitle('⚡ Challenge')
          .setDescription('Un nouveau challenge est disponible !\nPour participer au challenge, veuillez cliquer sur le bouton ci-dessous')
          .addFields(
              { name: '📋 Thème du challenge', value: `\`\`\`${theme}\`\`\`` },
              { name: '⏰ Date limite', value: `\`\`\`${dateFormatted}\`\`\`` },
              { name: '📜 Règles', value: `<#${SALON_REGLE_CHALLENGE}>` }
          )
          .setTimestamp();

      const button = new ButtonBuilder()
          .setCustomId('challenge_button')
          .setLabel('Participer au challenge')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⚡');

      const row = new ActionRowBuilder()
          .addComponents(button);

      await interaction.editReply({
          content: `<@&${CHALLENGE_ROLE}>`,
          embeds: [embed],
          components: [row]
      });

      // Envoyer un message dans le salon des événements
      const eventsChannel = await client.channels.fetch(SALON_EVENTS);
      if (eventsChannel) {
          const eventEmbed = new EmbedBuilder()
              .setColor('#4D177C')
              .setTitle('🎯 Nouveau Challenge Disponible')
              .addFields(
                  { name: '📋 Thème', value: `\`\`\`${theme}\`\`\`` },
                  { name: '⏰ À rendre avant le', value: `\`\`\`${dateFormatted}\`\`\`` },
                  { name: '📍 Où participer ?', value: `<#${SALON_CHALLENGE}>` },
                  { name: '📜 Règles', value: `<#${SALON_REGLE_CHALLENGE}>` }
              )
              .setTimestamp();

          await eventsChannel.send({
              content: `<@&${CHALLENGE_ROLE}> Hey les challengers, un nouveau challenge est disponible !`,
              embeds: [eventEmbed]
          });
      }
  }
}; 