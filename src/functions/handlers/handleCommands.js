const { REST } = require ('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const {GUILD_ID,CLIENT_ID} = process.env;
const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

module.exports = (client) => {
    client.handleCommands = async() => {
        const commandFolders = fs.readdirSync('./src/commands')
        for(const folder of commandFolders){
            const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter((file) => file.endsWith('.js'));
            const {commands, commandArray} = client;
            for (const file of commandFiles) {
              const command = require(`../../commands/${folder}/${file}`);
              if (!command.data || !command.data.name) {
                  console.error(`Invalid command data in ${file}.`);
                  continue; 
              }
          
              if (!command.execute) {
                  console.error(`La commande ${command.data.name} n'a pas de fonction execute()`);
                  continue;
              }
          
              commands.set(command.data.name, command);
              commandArray.push(command.data.toJSON());
              console.log(`Commande: ${command.data.name} est bien enregistrée`);
          }
          
        }

        try {
          console.log(`Mise à jour des commandes (/)`);
    
          await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: client.commandArray,
          });
    
          console.log('✅ Téléchargement des commandes (/)');
        } catch (error) {
          console.error(`❌(Fichier handleCommands) : ${error}`);
        }
      };
    };