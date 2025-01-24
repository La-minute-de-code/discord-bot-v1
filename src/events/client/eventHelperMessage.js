const { HELP_CATEGORY, HELPEURS_ROLE } = process.env;

console.log('✅ Système d\'aide activé');

module.exports = {
  name: "helpMsg",
  once: true,
  async execute(client) {
    client.on('threadCreate', async thread => {
      try {
        if (thread.parent && thread.parent.parentId === HELP_CATEGORY || thread.parent.id === HELP_CATEGORY) {
          const helpeurRole = thread.guild.roles.cache.get(HELPEURS_ROLE);
          
          if (helpeurRole) {
            await thread.send({
              content: `Bonjour ! Merci de patienter, un(e) <@&${HELPEURS_ROLE}> va s'occuper de votre problème. N'hésitez pas à partager votre code pour une réponse rapide et efficace. Veuillez rester courtois et respecter le règlement. Les helpeurs sont là pour vous aider. Nous rappelons également que le temps de réponse dépend également de l'heure où vous réalisez votre demande.`
            });
          }
        }
      } catch (error) {
        console.error('Erreur lors de la gestion du nouveau thread :', error);
      }
    });
  },
};
