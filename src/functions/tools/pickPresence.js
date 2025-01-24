const {ActivityType} = require('discord.js')

module.exports = (client) => {
    client.pickPresence = async() => {
        const options = [
            {
                type: ActivityType.Watching,
                text: `🚀 Planifie une mission spatiale`,
                status: "online"
            },
            {
                type: ActivityType.Listening,
                text: `🌱 Cultive des idées innovantes`,
                status: "idle"
            },
            {
                type: ActivityType.Playing,
                text: `🎉 Prépare une surprise`,
                status: "dnd"
            },
         ];
        const option = Math.floor(Math.random() * options.length);
         client.user.setPresence({
            activities: [{
                name: options[option].text,
                type: options[option].type
            }],
            status: options[option].status
        });
    };
};