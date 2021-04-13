module.exports = class Command {

	constructor(message, Client) {

		this.Client = Client;
		this.message = message;

	}

	send(message) {
		this.message.channel.send(message);
	}

	reply(message) {
		this.message.reply(message);
	}

}