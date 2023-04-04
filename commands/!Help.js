const config = require('../config')
const Discord = require('discord.js')
const EmbedBuilder = require('discord.js')
module.exports = {
    name: 'help',
    aliases: [],
    run: async (client, message, args) => {
let prefix = config.prefix
    
const help =  new Discord.MessageEmbed()
  .setTitle('Help Manager !')
 .setDescription(`\`${config.prefix}mybot\`\n **Permet de voir vos abonnements ! **\n\n \`${config.prefix}ping\`\n **Donne le ping du bot !** \n\n \`${config.prefix}uptime\`\n **Donne l’uptime du Manager !**\n\n\`${config.prefix}manage\`\n **Donne la possibilité de gère vos bots !**\n\n\`${config.prefix}buy\`\n**Envoie le lien pour acheter un bot !**`)
  .setColor(config.color)
  .setFooter(config.footer)
  message.reply({embeds: [help]})

}}


