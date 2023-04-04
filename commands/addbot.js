const ms = require("ms");
const config = require('../config')
const getNow = () => {
  return {
    time: new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  };
};
const db = require('quick.db')

module.exports = {
  name: "addbot",
  aliases: ["create"],
  run: async (client, message, args) => {
    if (config.owner.includes(message.author.id)  === true) {
    if (!args[0] || !args[1] || !args[2]) {
      return message.reply("Usage: `addbot @user @bot time(jour/h/m/s)`");
    }

    const user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]);
    if (!user) return message.reply("Impossible de trouver cet utilisateur.");

    let bot;
    try {
      bot = await client.users.fetch(args[1]);
    } catch (error) {
      return message.reply("Je n'ai pas trouvé ce bot.");
    }

    const time = ms(args.slice(2).join(" "));
    if (!time) return message.reply("Veuillez fournir une durée valide (ex: `1j`, `1h30m`, `10s`).");

    const botperso = { bot: bot.tag, botid: bot.id, date: Date.now() + time };
    db.push(`botperso_${message.guild.id}_${user.id}`, botperso);

    message.react("✅");
  }
}}
