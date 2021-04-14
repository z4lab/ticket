let Command = require(".");

const Channels = {
	parents: {
		open: "831574173464657931",
		closed: "831607684976476200"
	},
	accept: "831947045303746641"
}

const Groups = {
	supporter: "831557419293212782"
}

// TODO
/*
Remove messages on ticket creation
Autoclose tickets after 15 minutes
Block user from creating tickets after creation for 1 hour
*/


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
			},
			supporter: null,
			category: null
		}
		this.message.channel.fetchWebhooks()
			.then(hooks => {
				if (hooks.size > 0) {
					hooks.last().send({
						embeds: [{
							title: `Ticket #${this.ticket.id}`,
							color: "#B48EAD",
							fields: [{
								name: `Request created by ${this.ticket.creatorTag}`,
								value: "Any availible ticket supporter got notified. If none of them accepts your ticket in the next 15 minutes the ticket gets canceled. In that case try to reopen it in a few hours or contact an admin directly!"
							}]
						}]
					})
				} else {
					this.message.channel.createWebhook('Ticket System')
						.then(w => {
							w.send({
								embeds: [{
									title: `Ticket #${this.ticket.id}`,
									color: "#B48EAD",
									fields: [{
										name: `Request created by ${this.ticket.creatorTag}`,
										value: "Any availible ticket supporter got notified. If none of them accepts your ticket in the next 15 minutes the ticket gets canceled. In that case try to reopen it in a few hours or contact an admin directly!"
									}]
								}]
							})
						});
				}
			})
		
		this.message.guild.channels.resolve(Channels.accept).fetchWebhooks()
			.then(hooks => {
				hooks.last().send({
					content: `<@&${Groups.supporter}>`,
					embeds: [{
						title: `Ticket #${this.ticket.id}`,
						color: "#B48EAD",
						fields: [{
							name: "Requested by",
							value: this.ticket.creator,
							inline: true
						},{
							name: "Supporter",
							value: "N/A",
							inline: true
						},{
							name: "Category",
							value: "N/A",
							inline: true
						}]
					}]
				}).then(async m => {
					await m.react("✅");
					m.reactionFilter = (reaction, user) => {
						return ['✅'].includes(reaction.emoji.name) && user.id != m.author.id;
					};
					m.reactionCollector = m.createReactionCollector(m.reactionFilter, {
						time: 900000
					});
					m.reactionCollector.on('collect', async r => {
						if (r.emoji.name === "✅" && r.users.cache.last() != this.ticket.creator && !r.users.cache.last().bot) {
							this.ticket.supporter = r.users.cache.last();
							await m.delete();
							hooks.last().send({
								content: `<@&${Groups.supporter}>`,
								embeds: [{
									title: `Ticket #${this.ticket.id}`,
									color: "#A3BE8C",
									fields: [{
										name: "Requested by",
										value: this.ticket.creator,
										inline: true
									},{
										name: "Supporter",
										value: this.ticket.supporter,
										inline: true
									},{
										name: "Category",
										value: "N/A",
										inline: true
									}]
								}]
							}).then(() => {
								this.message.guild.channels.create("Ticket #" + this.ticket.id, {
									topic: `Ticket #${this.ticket.id} opened by ${this.ticket.creatorTag}`,
									parent: Channels.parents.open,
									permissionOverwrites: [{
										id: this.message.guild.roles.everyone,
										deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
									},{
										id: this.ticket.creator.id,
										allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
									},{
										id: this.ticket.supporter.id,
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
														value: this.ticket.id,
														inline: true
													},{
														name: "Opened by",
														value: this.ticket.creator,
														inline: true
													},{
														name: "Supporter",
														value: this.ticket.supporter,
														inline: true
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
												commandMessage.reactionCollector.on('collect', async r => {
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
																	id: this.message.guild.roles.everyone,
																	deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
																}, {
																	id: this.ticket.creator.id,
																	deny: ['SEND_MESSAGES'],
																	allow: ['VIEW_CHANNEL']
																}]);
														}
														if (this.ticket.solved.state == 2 && r.emoji.name === "❌") {
															if (this.ticket.closed.state) {
																await w.send({
																embeds: [{
																	title: "❌ Marked closed",
																	color: "#BF616A"
																}]
															})
															} else {
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
																	id: this.message.guild.roles.everyone,
																	deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
																}, {
																	id: this.ticket.creator.id,
																	deny: ['SEND_MESSAGES', 'VIEW_CHANNEL']
																}, {
																	id: this.ticket.supporter.id,
																	deny: ['SEND_MESSAGES'],
																	allow: ['VIEW_CHANNEL']
																}]);
															commandMessage.channel.setParent(Channels.parents.closed);
														}
													}

												});
											});
											w.send({
												content: "Commands: \ncomming soon™\n---"
											});
										});
								});
							});
						}
					});
				});
			});
		
	}
}