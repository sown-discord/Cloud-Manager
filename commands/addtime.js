const ms = require("ms");
const config = require('../config');
const db = require('quick.db');

module.exports = {
  name: "modifbot",
  aliases: ["addtime", "add"],
  description: "Modifie le temps d'un bot enregistré pour un utilisateur spécifique",
  usage: "+modifbot @nom_de_la_personne @nom_du_bot temps(jour/h/m/s)",
  cooldown: 3,
  run: async (client, message, args) => {
    if (!config.owner.includes(message.author.id)) return;
    
    const user = message.mentions.users.first() || await client.users.fetch(args[0]);
    if (!user) return message.channel.send(`\`❌\` Erreur : Veuillez mentionner un utilisateur valide !`);
    
    if (!db.has(`botperso_${message.guild.id}_${user.id}`)) {
        return message.channel.send(`\`❌\` Erreur : Cet utilisateur n'a pas enregistré de bot !`);
      }
      
      const bot = db.get(`botperso_${message.guild.id}_${user.id}`).find(b => b.botid === args[1]);
      if (!bot) return message.channel.send(`\`❌\` Erreur : Ce bot n'a pas été enregistré pour cet utilisateur !`);
    
    const time = ms(args.slice(2).join(" "));
    if (!time) return message.channel.send(`\`❌\` Erreur : Veuillez fournir une durée valide (ex: \`1j\`, \`1h30m\`, \`10s\`).`);

    db.set(`botperso_${message.guild.id}_${user.id}`, db.get(`botperso_${message.guild.id}_${user.id}`).map(b => {
      if (b.botid === bot.botid) {
        b.date = Date.now() + time;
      }
      return b;
    }));

    message.react("✅");
  }
};
