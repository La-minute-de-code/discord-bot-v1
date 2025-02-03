const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();
const { ADMIN_ROLE, MEMBERS_ROLE } = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sondage')
        .setDescription('Créer un sondage avec plusieurs options')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('La question du sondage')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Les options séparées par des virgules (max 9)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(ADMIN_ROLE)) {
            return await interaction.reply({
                content: 'Vous devez être administrateur pour utiliser cette commande!',
                ephemeral: true
            });
        }

        const question = interaction.options.getString('question');
        const optionsString = interaction.options.getString('options');
        const options = optionsString.split(',').map(option => option.trim());

        if (options.length > 9) {
            return await interaction.reply({
                content: 'Le sondage ne peut pas avoir plus de 9 options!',
                ephemeral: true
            });
        }

        const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
        
        let sondageMessage = `<@&${MEMBERS_ROLE}>\n\n\n📊 **${question}**\n\n`;
        options.forEach((option, index) => {
            sondageMessage += `${numberEmojis[index]} ${option}\n\n`;
        });

        const message = await interaction.reply({
            content: sondageMessage,
            fetchReply: true
        });

        for (let i = 0; i < options.length; i++) {
            await message.react(numberEmojis[i]);
        }
    },
};
