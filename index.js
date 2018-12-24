const debug = require("debug")("node:main");
const config = require("config");
const express = require("express");
const app = express();

require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();

const port = process.env.PORT || config.get("port");
const server = app.listen(port, () => {
	debug(`Listen on port ${port}...`);
});

module.exports = server;