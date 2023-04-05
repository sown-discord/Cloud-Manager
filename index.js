const {token, prefix} = require('./config')
const websocket = require("ws");
const Discord = require("discord.js");
const db = require('quick.db')
const fs = require('fs');
const { EmbedBuilder } = require("discord.js")
const ms = require("ms")
const config = require('./config')
const color = config.color
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

const client = new Discord.Client({intents: 32767});
client.login(token)

const addRoleToUser = async (userId, roleId) => {
  try {
    const guild = client.guilds.cache.get(config.guild);
    const member = await guild.members.fetch(userId);
    const role = guild.roles.cache.get(roleId); 
    await member.roles.add(role); 
    console.log(`Le rôle ${role.name} a été ajouté à l'utilisateur ${member.user.username}`);
  } catch (error) {
    console.error(`Erreur lors de l'ajout du rôle : ${error}`);
  }
};
const removeRoleFromUser = async (userId, roleId) => {
  try {
    const guild = client.guilds.cache.get(config.guild);
    const member = await guild.members.fetch(userId);
    const role = guild.roles.cache.get(roleId);
    await member.roles.remove(role);
    console.log(`Le rôle ${role.name} a été retiré de l'utilisateur ${member.user.username}`);
  } catch (error) {
    console.error(`Erreur lors du retrait du rôle : ${error}`);
  }
};

const checkExpiredBots = async (client) => {
  const allKeys = db.all().filter((data) => data.ID.startsWith("botperso_"));

  for (const keyObj of allKeys) {
    const data = db.get(keyObj.ID);
    let hasValidBot = false; // Indique si le membre a au moins un bot valide

    for (const botObj of data) {
      if (botObj.date < Date.now()) {
        db.delete(keyObj.ID, botObj);
        const user = await client.users.fetch(keyObj.ID.split("_")[2]);
        console.log(`Le bot \`${botObj.bot}\` a expiré`);
        user.send(`Le bot \`${botObj.bot}\` a expiré et a été supprimé de votre liste de bots.`);
      } else {
        hasValidBot = true;
      }
    }

    // Si le membre n'a plus de bots valides, retire le rôle
    if (!hasValidBot) {
      const guild = client.guilds.cache.get(config.guild);
      const member = guild.members.cache.get(keyObj.ID.split("_")[2]);
      const roleId = config.client;
      if (member) {
        removeRoleFromUser(member.user.id, roleId);
      }
    } else {
      // Sinon, ajoute le rôle si le membre ne l'a pas déjà
      const guild = client.guilds.cache.get(config.guild);
      const member = guild.members.cache.get(keyObj.ID.split("_")[2]);
      const roleId = config.client;
      if (member && !member.roles.cache.has(roleId)) {
        addRoleToUser(member.user.id, roleId);
      }
    }
  }
};

setInterval(() => {
  checkExpiredBots(client);
}, 5000);



const server = new websocket.Server({port: 30132});
const allServers = []
server.on('connection', ws => {
    console.log("Connectée au Lumina [Manager] Gateway")
    
    ws.on('message', async data => {
        console.log(JSON.parse(data))
        let received = JSON.parse(data)
            client.channels.cache.get(config.channel).send({
             embeds: [
               new Discord.MessageEmbed()
                 .setColor("#FAA61A")
                 .setTitle("**Connection au Lumina [Manager] Gateway**")
                 .setFooter(
                   `Connection au Lumina [Manager] Gateway`,
                 ),
             ],})

 


          
        client.channels.cache.get(config.channel).send({
                 embeds: [
                 
                   new Discord.MessageEmbed()
                     .setColor("#3BA55C")
                     .setTitle("**Connection au système**")
                     .setDescription(`**${received.tag}** (id: \`${received.id}\`) vient de se connecter au système.`)
                     .setFooter(
                       `Connection au Lumina [Manager] Manager à ${getNow().time}`,
                     ),
            ],})
          
          
        
     
        if(received.type === "connection"){
            allServers.push({
                id : received.id,
                ws : ws,
                tag: received.tag
                
              
            }
        ) 
    } })})
    
  



client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
    const commands = require(`./commands/${file}`)
    client.commands.set(commands.name, commands)

   console.log(`> [HANDLER] ${commands.name}`)
}
client.on('ready', () => {
   console.log(`${client.user.tag} c'est connecté à ${getNow().time}!`)
    client.channels.cache.get(config.channel).send({
        embeds: [
          new Discord.MessageEmbed()
            .setColor("#ED4245")
            .setTitle("**Le Manager viens de démarre !**")
            .setFooter(
              `Connection du Lumina [Manager] Manager à ${getNow().time}`,
            ),
        ],})
      
        setInterval(() => {
          const botCount = db.all().filter(data => data.ID.startsWith("botperso_")).length;

          
          client.user.setActivity(`Surveille ${botCount} bots`, {
            type: "STREAMING",
            url: "https://www.twitch.tv/oni145"
          });
        }, 10000);



client.on('messageCreate', async (message, arg)  => {
  
  if (config.owner.includes(message.author.id)  === true) {

  if (message.content.startsWith(`${config.prefix}kill`)) { 
    let args = message.content.split(' ')
    let askedBot = args[1]
    let theConnection = allServers.find(bot => bot.id === askedBot )
    if(!theConnection) return message.reply("Bot inconnue")
     message.reply("Bot stoper !")
    theConnection.ws.send(JSON.stringify({
     cmd: "stop",
     restart: "process.exit(1)"
  
    }))}

   
  if (message.content.startsWith(`${config.prefix}restart`)) { 
  let args = message.content.split(' ')
  let askedBot = args[1]
  let theConnection = allServers.find(bot => bot.id === askedBot )
  if(!theConnection) return message.reply("Bot inconnue.")
   message.reply("Bot redémarre !")
  theConnection.ws.send(JSON.stringify({
   cmd: "restart",
   restart: "process.exit(2)",
  }
 
)

)


}

if (message.content.startsWith(`${config.prefix}uc`)) {
  message.reply(`<a:asetting:1076964471622340654> Relancement effectué...`)
  console.clear()
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
    const commands = require(`./commands/${file}`)
    client.commands.set(commands.name, commands)

   console.log(`> [HANDLER] ${commands.name}`)
  
}
console.log(`${client.user.tag} c'est connecté à ${getNow().time}!`)
}



}
if (!message.content.startsWith(prefix)) return;

let messageArray = message.content.split(" ");
const args1 = message.content.slice(prefix.length).split(/ +/);
const commandName = args1.shift().toLowerCase();
let args = messageArray.slice(1);
let command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));



if (command) command.run(client, message, args);  


    

})})




process.on("unhandledRejection", (reason, p) => {
  console.log(" [AntiCrash] :: Unhandled Rejection/Catch");
  console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
  console.log(" [AntiCrash] :: Uncaught Exception/Catch");
  console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(" [AntiCrash] :: Uncaught Exception/Catch (MONITOR)");
  console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
  console.log(" [AntiCrash] :: Multiple Resolves");
  console.log(type, promise, reason);
});