function fixTime(number) {
	if (number < 10) number = '0' + number;
	return number;
};

module.exports = (inDate, log) => {
		if (!inDate) inDate = new Date();
		if (!(inDate instanceof Date)) inDate = new Date();
		if (log) return `${fixTime(inDate.getMonth() + 1)}_${fixTime(inDate.getDate())}_${fixTime(inDate.getFullYear())}-${fixTime(inDate.getHours() ? inDate.getHours() : 12) + "_" + fixTime(inDate.getMinutes()) + (inDate.getHours() >= 12 ? "PM" : "AM")}`;
		return `[${fixTime(inDate.getMonth() + 1)}/${fixTime(inDate.getDate())}/${fixTime(inDate.getFullYear())}] [${fixTime(inDate.getHours() ? inDate.getHours() : 12) + ":" + fixTime(inDate.getMinutes()) + ":" + fixTime(inDate.getSeconds()) + " " + (inDate.getHours() >= 12 ? "PM" : "AM")}]`;
	}