module.exports = class Logger {

	constructor(Client) {

		this.logDir = __dirname + "/../../../logs";

		this.Client = Client;
		this.logID = 0;
		this.timeStamp = require("./timeStamp");

		this.Console = new console.Console({
			stdout: require("fs").createWriteStream(this.logDir + `/out-${this.timeStamp(false, true)}.log`), 
			stderr: require("fs").createWriteStream(this.logDir + `/err-${this.timeStamp(false, true)}.log`)
		})

	}

	log(message, id = this.logID) { // basic log
		if (id == this.logID) this.logID++; // increase log id if no id is provided
		this.Console.log("LOG  ~",this.timeStamp(), `#${id}:`, message);
	}

	warn(message, id = 0) { // basic warn log
		this.Console.warn("WARN ~", this.timeStamp(), `#${id}:`, message);
	}

	error(message, id = 0) { // basic error log
		this.Console.error("ERR  ~",this.timeStamp(), `#${id}:`, message);
	}

}