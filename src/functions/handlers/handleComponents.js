const {readdirSync} = require('fs')



module.exports = (client) => {
    client.handleComponents = async() => {
        const componentsFolders = readdirSync('./src/components')
        for(const folder of componentsFolders){
            const componentFiles = 
            readdirSync(`./src/components/${folder}`)
            .filter((file) => file.endsWith('.js'));
            
            switch(folder){
                case "modals":
                    for(const file of componentFiles) {
                        const modal = require(`../../components/${folder}/${file}`);
                        client.modals.set(modal.data.name, modal);
                    }
                    break;
                default:
                    break;
            }
        }
    }
}