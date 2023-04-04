const config = require('../config')
const { MessageEmbed } = require("discord.js")
const Discord = require('discord.js')
module.exports = {
    name: 'buy',
    aliases: [],
    run: async (client, message, args) => {
let prefix = config.prefix
    
const Buy = new Discord.MessageEmbed()
  .setTitle('Clique ici pour acheter un bot !')
  .setURL(config.support)
  .setColor(config.color)
  message.reply({embeds: [Buy]})

}}


