const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

let chatChannel = null;
let lastCleanupMessage = null;
let firstMessageId = null;

function createSaveButton() {
    const saveButton = new ButtonBuilder()
        .setCustomId('save_conversation')
        .setLabel('Sauvegarder la conversation')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💾');

    return new ActionRowBuilder().addComponents(saveButton);
}

async function execute(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        
        if (!firstMessageId) {
            const oldestMessages = await chatChannel.messages.fetch({ limit: 1, after: '0' });
            if (oldestMessages.size > 0) {
                firstMessageId = oldestMessages.first().id;
            }
        }

        let messages = [];
        let lastId = null;
        
        while (true) {
            const options = { limit: 100 };
            if (lastId) options.before = lastId;
            
            const fetchedMessages = await chatChannel.messages.fetch(options);
            if (fetchedMessages.size === 0) break;
            
            const filteredMessages = fetchedMessages.filter(msg => 
                (msg.id !== firstMessageId) &&
                (msg.author.id === interaction.user.id ||
                 msg.author.id === chatChannel.client.user.id)
            );
            messages.push(...filteredMessages.values());
            lastId = fetchedMessages.last().id;
            
            if (fetchedMessages.find(m => m.id === lastCleanupMessage)) break;
        }

        let conversation = `📝 Historique de votre conversation avec ${chatChannel.client.user.username} :\n\n`;
        messages.reverse().forEach(msg => {
            const isBot = msg.author.id === chatChannel.client.user.id;
            const username = isBot ? chatChannel.client.user.username : "Vous";
            conversation += `${username}: ${msg.content}\n\n`;
        });

        if (conversation.length > 2000) {
            const parts = conversation.match(/[\s\S]{1,1900}/g) || [];
            for (const part of parts) {
                await interaction.user.send(part);
            }
        } else {
            await interaction.user.send(conversation);
        }

        await interaction.editReply({ content: "✅ La conversation a été sauvegardée et envoyée en message privé !", ephemeral: true });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la conversation:', error);
        await interaction.editReply({ content: "❌ Une erreur est survenue lors de la sauvegarde de la conversation.", ephemeral: true });
    }
}

function setChannel(channel) {
    chatChannel = channel;
}

function setFirstMessageId(id) {
    firstMessageId = id;
}

function setLastCleanupMessage(id) {
    lastCleanupMessage = id;
}

module.exports = { createSaveButton, execute, setChannel, setFirstMessageId, setLastCleanupMessage };
