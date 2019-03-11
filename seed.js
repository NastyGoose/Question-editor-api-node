const {
	Patch
} = require("./models/patch");
const mongoose = require("mongoose");
const config = require("config");
const debug = require("debug")("node:seed");

const data = {
	name: "00.00.00",
	description: "seed",
	dateRelease: new Date()
};

async function seed() {
	await mongoose.connect(config.get("db.uri"), config.get("db.options"));

	await Patch.deleteMany({});

	await new Patch(data).save();

	mongoose.disconnect();

	debug("Done!");
}

seed();