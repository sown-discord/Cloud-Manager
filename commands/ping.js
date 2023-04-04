const config = require('../config');
const { MessageEmbed } = require("discord.js");
const Discord = require('discord.js');
module.exports = {
    name: 'ping',
    aliases: ["speed"],
    run: async (client, message, args) => {
let prefix = config.prefix

const pingUser = Date.now() - message.createdTimestamp;
let emojiUser;
if(pingUser <= 200) { emojiUser = "🟢" } 
else if (pingUser <= 400 && pingUser >= 200) { emojiUser = "🟠" }
else if(pingUser >= 400) {emojiUser = "🔴" };
const APIPing = client.ws.ping;
let APIemoji;
if(APIPing <= 200) { APIemoji = "🟢" }
else if(APIPing <= 400 && APIPing >= 200) { APIemoji = "🟠" }
else if(APIPing >= 400) {APIemoji = "🔴" }

let PingEmbed = new Discord.MessageEmbed()
.setColor(config.color)
    .setDescription(`
    \`${emojiUser}\`Votre ping : **${pingUser}ms**
    \`${emojiUser}\`Mon ping est de : **${client.ws.ping}ms**
    \`${APIemoji}\`API Gateway : **${APIPing}ms**`)
    .setFooter(`Onyx Manager`)
    message.channel.send({embeds : [PingEmbed]})
}
    }