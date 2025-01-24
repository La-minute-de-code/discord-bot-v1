const { Events } = require('discord.js');
const { SALON_TOTAL_MEMBERS } = process.env;

module.exports = {
    name: 'ready',
    once: false,
    async execute(client) {
        try {
            console.log('✅ Système de compteur de membres activé');
            console.log('ID du salon compteur:', SALON_TOTAL_MEMBERS);
            
            const updateCounter = async () => {
                const channel = client.channels.cache.get(SALON_TOTAL_MEMBERS);
                if (!channel) {
                    console.error('Salon compteur non trouvé. Vérifiez l\'ID dans .env');
                    return;
                }

                const guild = channel.guild;
                const memberCount = guild.memberCount;
                console.log('Mise à jour du compteur:', memberCount, 'membres');
                
                try {
                    await channel.setName(`👥 Total Membres : ${memberCount}`);
                    console.log('Compteur mis à jour avec succès');
                } catch (err) {
                    console.error('Erreur lors de la mise à jour du nom du salon:', err);
                }
            };

            await updateCounter();
            setInterval(updateCounter, 2 * 60 * 1000);
            client.updateMemberCount = updateCounter;
            
        } catch (error) {
            console.error('Erreur compteur:', error);
        }
    },
};