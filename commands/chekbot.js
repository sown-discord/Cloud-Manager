const { MessageEmbed, MessageSelectMenu, MessageActionRow } = require("discord.js");
const db = require('quick.db');
const config = require('../config');

module.exports = {
  name: "checkbots",
  description: "Affiche les informations de tous les bots enregistrés",
  usage: "checkbots",
  cooldown: 3,
  run: async (client, message, args) => {
    const allBotData = db.all().filter(data => data.ID.startsWith(`botperso_${message.guild.id}_`));
    const buyer = db.get(`botperso_${message.guild.id}_${message.author.id}`);

    if (!allBotData.length) {
      return message.channel.send("Il n'y a aucun bot enregistré dans la base de données !");
    }

    const botsPerPage = 5; // nombre de bots à afficher par page
    const totalPages = Math.ceil(allBotData.length / botsPerPage); // nombre total de pages
    let currentPage = 1; // page actuelle

    const generateEmbed = (page) => {
      const embed = new MessageEmbed()
        .setColor(config.color)
        .setTitle(`Liste de tous les bots enregistrés (Page ${page}/${totalPages})`)
        .setDescription("Voici les informations de tous les bots enregistrés dans la base de données :");

      const startIndex = (page - 1) * botsPerPage; // index de début de la page
      const endIndex = startIndex + botsPerPage; // index de fin de la page

      allBotData.slice(startIndex, endIndex).forEach(data => {
        const user = client.users.cache.get(data.ID.split("_")[2]);
        const bots = data.data;

        if (bots && bots.length) {
          embed.addField(`${user.tag}`, bots.map(bot => {
            return `**ID du bot** : ${bots.id || "Impossible de récuperè id !"}\n**Tag du buyer** : ${user.tag}\n**Date d'expiration** : <t:${Math.floor(new Date(bot.date).getTime() / 1000)}:R>`;
          }).join("\n\n"), false);
        }
      });

      return embed;
    };

    const selectMenu = new MessageSelectMenu()
      .setCustomId('paginator')
      .setPlaceholder('Page')
      .setMinValues(1)
      .setMaxValues(totalPages);

    for (let i = 1; i <= totalPages; i++) {
      selectMenu.addOptions({
        label: `${i}`,
        value: `${i}`
      });
    }

    const actionRow = new MessageActionRow().addComponents(selectMenu);

    const messageEmbed = await message.channel.send({
      embeds: [generateEmbed(currentPage)],
      components: [actionRow]
    });

    const filter = i => i.customId === 'paginator' && i.user.id === message.author.id;

    const collector = messageEmbed.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async i => {
      await i.deferUpdate();

      currentPage = parseInt(i.values[0]); // mettre à jour la page actuelle

      const newEmbed = generateEmbed(currentPage);

      messageEmbed.edit({ embeds: [newEmbed] });
    });

    collector.on('end', async () => {
      const disabledSelectMenu = new MessageSelectMenu()
        .setCustomId('paginator')
        .setPlaceholder('Terminé')
        .setDisabled(true);

      actionRow.components = [disabledSelectMenu];

      messageEmbed.edit({ components: [actionRow] });
    });
  }
};
