const Discord = require('discord.js');
const db = require('quick.db');
const config = require('../config');
const color = config.color;

module.exports = {
    name: 'bot',
    description: "Affiche les bots d'un utilisateur spécifique",
    usage: "+bot @nom_de_la_personne",
    cooldown: 3,
     run: async (client, message, args) => {
        const user = message.mentions.users.first() || (args[0] ? await message.guild.members.fetch(args[0]).user : null);
        if (!user) return message.channel.send(`\`❌\` Erreur : Veuillez mentionner un utilisateur valide !`);
        
        const bots = db.get(`botperso_${message.guild.id}_${user.id}`);
        if (!bots) {
            return message.channel.send(`\`❌\` Erreur : Cet utilisateur n'a aucun bot enregistré !`);
        }

        const selectMenuOptions = bots.map(bot => {
            return {
                label: bot.bot,
                description: `Information du bot`,
                value: bot.botid
            };
        });

        const selectMenu = new Discord.MessageSelectMenu()
            .setCustomId('bot-select')
            .setPlaceholder(`${user.username}'s - Sélectionnez un bot`)
            .addOptions(selectMenuOptions);

        const embed = new Discord.MessageEmbed()
            .setTitle(`Bots de ${user.username}`)
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
                .setDescription(`**ID :** \`${selectedBot.botid}\`\n**Expire :** <t:${Math.floor(new Date(selectedBot.date).getTime() / 1000)}:R>\n **Invite :** [\`[Clique ici pour inviter votre bot]\`](https://discord.com/api/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot)\n**Buyer :** \`${user.tag}\``)
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
                .setPlaceholder(`${user.username}'s - Sélectionnez un bot`)
                .addOptions(selectMenuOptions);

            const newActionRow = new Discord.MessageActionRow()
                .addComponents(newSelectMenu);

            await i.update({ embeds: [botEmbed], components: [newActionRow] });
        });
    }
}
