const Discord = require("discord.js")
const config = require('../config')
module.exports = {
    name: 'uptime',
    aliases: ["up"],
    run: async (client, message, args) => {
     let prefix = config.prefix
        

        let days = Math.floor((client.uptime / (1000 * 60 * 60 * 24)) % 60).toString();
        let hours = Math.floor((client.uptime / (1000 * 60 * 60)) % 60).toString();
        let minuts = Math.floor((client.uptime / (1000 * 60)) % 60).toString();
        let seconds = Math.floor((client.uptime / 1000) % 60).toString();
        
         const embed =  new Discord.MessageEmbed()
        .setColor(config.color)
        .setDescription(`**Uptime du Bot** : ${days} jours ${hours} heures ${minuts} minute ${seconds} secondes.`)
        .setFooter(config.footer)
        message.reply({embeds: [embed]})
    }
}