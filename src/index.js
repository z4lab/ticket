const Discord = {};

Discord.require = {
	Bot: require(__dirname + "/Bot")
}

Discord.Bot = new Discord.require.Bot();
Discord.Bot.Config = require(__dirname + "/../config");

Discord.Bot.Client.login(Discord.Bot.Config.token || process.argv.slice(2)[0]); 