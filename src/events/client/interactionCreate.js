const {  ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const saveChatBotButton = require('../../components/buttons/saveChatBotButton');


module.exports = {
    name: "interactionCreate",
    async execute(interaction, client){
        if(interaction.isChatInputCommand()){
            const {commands} = client;
            const {commandName} = interaction;
            const command = commands.get(commandName);
            if(!command) return;

            try{
                await command.execute(interaction, client);
            }catch(error){
                console.error(`❌(Fichier interactionCreate) : ${error}`);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: `Une erreur est survenue lors de l'exécution de la commande`,
                        ephemeral: true
                    });
                }
            }
        } 
        
        if (interaction.isButton()) {
            if (interaction.customId === 'save_conversation') {
                await saveChatBotButton.execute(interaction);
                return;
            }

            if (interaction.customId === 'bouton-idee') {
                const modal = new ModalBuilder()
                    .setCustomId('Modal-idea')
                    .setTitle('💡 Proposer une idée de tutoriel');

                const textInput = new TextInputBuilder()
                    .setCustomId('inputTextModalIdea')
                    .setLabel('Quelle est votre idée de tutoriel ?')
                    .setPlaceholder('Décrivez votre idée en détail...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMinLength(10)
                    .setMaxLength(1000)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(textInput));
                await interaction.showModal(modal);
            }


            if(interaction.customId === 'challenge_button'){
                const modal = new ModalBuilder()
                    .setCustomId('Modal-challenge')
                    .setTitle('💡 Proposer votre projet pour le challenge');

                const textInput = new TextInputBuilder()
                    .setCustomId('inputTextChallenge')
                    .setLabel('Quelle est le lien github de votre projet ?')
                    .setPlaceholder('Décrivez en quelques mots votre projet...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMinLength(10)
                    .setMaxLength(1000)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(textInput));
                await interaction.showModal(modal);
            }
        }
        
        if (interaction.isModalSubmit()) {
            const modal = client.modals.get(interaction.customId);
            
            if (!modal) {
                console.error(`Pas de modal trouvé pour l'ID ${interaction.customId}`);
                return;
            }

            try {
                await modal.execute(interaction, client);
            } catch (error) {
                console.error(`Erreur lors de l'exécution du modal: ${error}`);
                await interaction.reply({
                    content: 'Une erreur est survenue lors du traitement de votre soumission.',
                    ephemeral: true
                });
            }
        }
    }
}