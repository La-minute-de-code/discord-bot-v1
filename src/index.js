require('dotenv').config();
const { TOKEN } = process.env;
const {Client, Collection, GatewayIntentBits, Partials, IntentsBitField } = require('discord.js')
const fs = require('fs')



const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,

    ],
    'partials': [Partials.Channel]
});
client.commands = new Collection();
client.commandArray =  [ ];
client.modals = new Collection();
client.buttons = new Collection();

const functionFolders = fs.readdirSync(`./src/functions`)
for(const folder of functionFolders){
    const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file ) => file.endsWith('.js'));
    for(const file of functionFiles) require(`./functions/${folder}/${file}`)(client);
}


module.exports = {
    client: client
}

client.handleEvents();
client.handleComponents();
client.handleCommands();
client.login(TOKEN);
client.on('ready', () => {
    console.log('Bot connecté !');
});