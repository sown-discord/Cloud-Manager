const config = require('../config')
const db = require('quick.db')
module.exports = {
    name: "deletebot",
    aliases: ["removebot"],
    run: async (client, message, args) => {
        if (config.owner.includes(message.author.id)  === true) {
      const userId = args[0];
      const botId = args[1];
      if (!userId || !botId) {
        return message.reply("Usage: `deletebot @user @bot`");
      }
  
      const user = message.mentions.users.first() || client.users.cache.get(userId) || await client.users.fetch(userId);
      if (!user) return message.reply("Impossible de trouver cet utilisateur.");
  
      let bot;
      try {
        bot = await client.users.fetch(botId);
      } catch (error) {
        return message.reply("Je n'ai pas trouvé ce bot.");
      }
  
      const botpersos = db.get(`botperso_${message.guild.id}_${user.id}`, []);
      const botIndex = botpersos.findIndex(b => b.botid === bot.id);
      if (botIndex === -1) {
        return message.reply("Ce bot n'a pas été ajouté par cet utilisateur.");
      }
  
      botpersos.splice(botIndex, 1);
      db.delete(`botperso_${message.guild.id}_${user.id}`, botpersos);
  
      message.react("✅");
    }
  }}
  