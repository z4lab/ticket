module.exports = (message, Client) => {
	if (message.author.bot) return;
	if (!message.content.startsWith(Client.Config.prefix)) return;

	message.rawContent = message.content;
	message.content = message.content.slice(Client.Config.prefix.length);
	message.args = message.content.split(" ");
	message.command = message.args.shift();

	if (Client.Commands[message.command]) new Client.Commands[message.command](message, Client).run();
}