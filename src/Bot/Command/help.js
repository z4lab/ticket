let Command = require(".");

module.exports = class extends Command {
	getInfo() {
		return "shows all commands";
	}
	run() {
		this.tempContent = "~ Commands\n";
		Object.keys(this.Client.Commands).forEach(command => {
			if (new this.Client.Commands[command]().getInfo() != false) this.tempContent += this.Client.Config.prefix + command + " - " + (new this.Client.Commands[command]().getInfo() || "N/A") + "\n";
		});
		this.send(this.tempContent);
		delete this.tempContent;
	}
}