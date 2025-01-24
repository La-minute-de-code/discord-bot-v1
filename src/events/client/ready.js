const { Events } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Le BOT ${client.user.tag} est en ligne.`);
        
        client.emit('memberCounter', client, client.guilds.cache.first());
        
        setInterval(client.pickPresence, 100 * 1000);
        
        // Émettre les événements de base
        client.emit('eventCounterMembers', client);
        client.emit('eventQuizs');
        client.emit('eventHelperMessage');
    

        console.log('✅ Tous les systèmes sont initialisés');
    },
};
