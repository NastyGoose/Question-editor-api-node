const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	underscore: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",

	fgBlack: "\x1b[30m",
	fgRed: "\x1b[31m",
	fgGreen: "\x1b[32m",
	fgYellow: "\x1b[33m",
	fgBlue: "\x1b[34m",
	fgMagenta: "\x1b[35m",
	fgCyan: "\x1b[36m",
	fgWhite: "\x1b[37m",

	bgBlack: "\x1b[40m",
	bgRed: "\x1b[41m",
	bgGreen: "\x1b[42m",
	bgYellow: "\x1b[43m",
	bgBlue: "\x1b[44m",
	bgMagenta: "\x1b[45m",
	bgCyan: "\x1b[46m",
	bgWhite: "\x1b[47m",
};

module.exports = color => {
	const currentDate = new Date();
	let hh = currentDate.getHours();
	let mm = currentDate.getMinutes();
	let ss = currentDate.getSeconds();

	if (hh < 10)
		hh = `0${hh}`;

	if (mm < 10)
		mm = `0${mm}`;

	if (ss < 10)
		ss = `0${ss}`;

	return `${color || colors.fgGreen}${hh}:${mm}:${ss}${colors.reset}`;
};