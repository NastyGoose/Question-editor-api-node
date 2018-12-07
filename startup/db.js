const mongoose = require("mongoose");
const debug = require("debug")("node:db");
const config = require("config");

module.exports = function () {
    const uri = config.get("db.uri");
    const options = config.get("db.options");
    mongoose.connect(uri, options)
        .then(() => debug(`Connected to ${uri}...`));
}