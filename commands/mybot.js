const Discord = require("discord.js");
const config = require('../config');
const db = require('quick.db');
const color = config.color;

module.exports = {
  cooldown: 3,
  name: 'mybot',
  category: "Buyer",
  usage: "manage",
  description: "Permet de gérer son bot",
  run: async (client, message, args) => {
    const user = message.author || client.users.cache.get(args[0]) || await client.users.fetch(args[0]);
    const bots = db.get(`botperso_${message.guild.id}_${user.id}`);
    if (bots == null) return message.channel.send(`\`❌\` Erreur : Vous n'avez pas de bot !`);
  
    const selectMenuOptions = bots.map(bot => {
      return {
        label: bot.bot,
        description: `Information du bot`,
        value: bot.botid
      };
    });

    const selectMenu = new Discord.MessageSelectMenu()
      .setCustomId('bot-select')
      .setPlaceholder('Cloud\'s - Sélectionnez un bot')
      .addOptions(selectMenuOptions);

    const embed = new Discord.MessageEmbed()
      .setTitle(`Liste de vos bots`)
      .setColor(color)
      .setDescription('Sélectionnez un bot dans le menu ci-dessous')
      .setTimestamp();

    const messageSent = await message.channel.send({ embeds: [embed], components: [{ type: 'ACTION_ROW', components: [selectMenu] }] });

    const filter = i => i.customId === 'bot-select' && i.user.id === message.author.id;
    const collector = messageSent.createMessageComponentCollector({ filter, time: 15000 });
    collector.on('collect', async i => {
      const botId = i.values[0];
      const selectedBot = bots.find(bot => bot.botid === botId);

      const botEmbed = new Discord.MessageEmbed()
      .setTitle(`Informations sur ${selectedBot.bot}`)
        .setColor(color)
        .setDescription(`**ID :** \`${selectedBot.botid}\`\n**Expire :** <t:${Math.floor(new Date(selectedBot.date).getTime() / 1000)}:R>\n **Invite :** [\`[Clique ici pour inviter votre bot]\`](https://discord.com/api/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot)\n**Buyer :** ${message.author.tag}`)
        .setTimestamp();

      const selectMenuOptions = bots.map(bot => {
        return {
          label: bot.bot,
          description: `Information du bot`,
          value: bot.botid,
          default: bot.botid === selectedBot.botid
        };
      });

      const newSelectMenu = new Discord.MessageSelectMenu()
        .setCustomId('bot-select')
        .setPlaceholder('Cloud\'s - Sélectionnez un bot')
        .addOptions(selectMenuOptions);

      const newActionRow = new Discord.MessageActionRow()
        .addComponents(newSelectMenu);

      await i.update({ embeds: [botEmbed], components: [newActionRow] });
    });
  }
};
