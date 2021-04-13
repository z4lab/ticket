let Command = require(".");

module.exports = class extends Command {
	getInfo() {
		return false;
	}
	run() {
		this.message.delete();
		this.ticket = {
			id: String((Math.floor(Math.random() * 9000) + 1000)),
			creator: this.message.author,
			creatorTag: this.message.author.username + "#" + this.message.author.discriminator,
			solved: {
				state: 0
			},
			closed: {
				state: false
			}
		}
		this.Client.Client.guilds.cache.first().channels.create("Ticket #" + this.ticket.id, {
				topic: `Ticket #${this.ticket.id} opened by ${this.ticket.creatorTag}`,
				parent: "831574173464657931",
				permissionOverwrites: [{
					id: this.Client.Client.guilds.cache.first().roles.everyone,
					deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
				}, {
					id: this.ticket.creator.id,
					allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
				}]
			})
			.then(channel => {
				channel.createWebhook('Ticket System')
					.then(w => {
						w.send({
							content: `Welcome ${this.ticket.creator}`,
							embeds: [{
								title: "Ticket Details",
								color: "#5E81AC",
								fields: [{
									name: "Ticket ID",
									value: this.ticket.id
								}, {
									name: "Opened by",
									value: this.ticket.creatorTag + ` ~ (${this.ticket.creator.id})`
								}]
							}]
						}).then(async commandMessage => {
							await commandMessage.react("✅");
							await commandMessage.react("❌");
							commandMessage.reactionFilter = (reaction, user) => {
								return ['✅', '❌'].includes(reaction.emoji.name) && user.id != commandMessage.author.id;
							};
							commandMessage.reactionCollector = commandMessage.createReactionCollector(commandMessage.reactionFilter, {
								time: 900000
							});
							commandMessage.reactionCollector.on('collect', r => {
								if (r.users.cache.last().id === this.ticket.creator.id) {
									if (this.ticket.solved.state == 0 || !this.ticket.closed.state) {
										if (r.emoji.name === "✅") {
											this.ticket.solved.state = 1;
											w.send({
												embeds: [{
													title: "☑️ Solved marking requested by user",
													color: "#5E81AC"
												}]
											});
										}
										if (r.emoji.name === "❌" && this.ticket.solved.state == 2) {
											this.ticket.closed.state = true;
											w.send({
												embeds: [{
													title: "☑️ Closed marking requested by user",
													color: "#5E81AC"
												}]
											});
										}
									}
								} else {
									if (this.ticket.solved.state == 1 && r.emoji.name === "✅") {
										this.ticket.solved.state = 2;
										w.send({
											embeds: [{
												title: "✅ Marked solved",
												color: "#A3BE8C"
											}]
										})
										commandMessage.channel.overwritePermissions(
											[{
												id: this.Client.Client.guilds.cache.first().roles.everyone,
												deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
											}, {
												id: this.ticket.creator.id,
												deny: ['SEND_MESSAGES'],
												allow: ['VIEW_CHANNEL']
											}]);
									}
									if (this.ticket.solved.state == 2 && r.emoji.name === "❌") {
										if (this.ticket.closed.state) await w.send({
											embeds: [{
												title: "❌ Marked closed",
												color: "#BF616A"
											}]
										})
										else {
											this.ticket.closed.state = true;
											await w.send({
												embeds: [{
													title: "❌ Marked force closed",
													color: "#BF616A"
												}]
											})
										}
										commandMessage.channel.overwritePermissions(
											[{
												id: this.Client.Client.guilds.cache.first().roles.everyone,
												deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
											}, {
												id: this.ticket.creator.id,
												deny: ['SEND_MESSAGES', 'VIEW_CHANNEL']
											}]);
										commandMessage.channel.setParent("831607684976476200");
									}
								}

							});
						});
						w.send({
							content: "Commands: \ncomming soon™\n---"
						});
					});
			});
	}
}