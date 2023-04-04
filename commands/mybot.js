const Discord = require("discord.js");
const config = require('../config');
const db = require('quick.db');
const color = config.color;
const WebSocket = require("ws");

module.exports = {
  cooldown: 3,
  name: 'mybot',
  category: "Buyer",
  usage: "mybot",
  description: "Affiche vos bot",
  run: async (client, message, args) => {
    const user = message.author || client.users.cache.get(args[0]) || await client.users.fetch(args[0]);
    const bots = db.get(`botperso_${message.guild.id}_${user.id}`);
    if (bots == null) return message.channel.send(`\`❌\` Erreur : Vous n'avez pas de bot !`);

    let botList = '';
    let askedBot = args[1];
    const ws = new WebSocket("ws://51.255.215.122:30132"); // Adresse du WebSocket

    ws.on("open", () => {
      ws.send(JSON.stringify({ botId: askedBot })); // Envoi l'ID du bot
    });

    ws.on("message", (data) => {
      const connected = JSON.parse(data); // Vérifie si le bot est connecté ou non
      bots.forEach((bot, index) => {
        if (bot.botid === askedBot) {
          botList += `${index + 1}. ${bot.bot} (${connected ? 'Connecté' : 'Déconnecté'})\n`;
        } else {
          botList += `${index + 1}. ${bot.bot}\n`;
        }
      });

      const embed = new Discord.MessageEmbed()
        .setTitle(`Liste de vos bots`)
        .setColor(color)
        .setDescription(botList)
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    });
  }
};
