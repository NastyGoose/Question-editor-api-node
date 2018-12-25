const mongoose = require("mongoose");
const {
	Patch
} = require("./models/patch");
const {
	User
} = require("./models/user");
const {
	Test
} = require("./models/test");

const {
	admin
} = require("./permission/types");
const bcrypt = require("bcrypt");

const config = require("config");
const debug = require("debug")("node:seed");

const patch = {
	name: "00.00.00",
	description: "seed",
	dateRelease: new Date()
};
const user = {
	name: process.env.ADMIN_NAME || "Admin",
	email: process.env.ADMIN_EMAIL || "quesed2000@gmail.com",
	password: process.env.ADMIN_PASSWORD,
	permission: admin
};
const tests = [{
	question: "В каком году произошла Вторая мировая война?",
	answers: [{
		answer: "1938"
	}, {
		answer: "1939",
		isCorrect: true
	}, {
		answer: "1940"
	}, {
		answer: "1941"
	}],
	description: "Это война двух мировых военно-политических коалиций, ставшая крупнейшим вооружённым конфликтом в истории человечества."
}, {
	question: "Кто первый президент Республики Беларусь?",
	answers: [{
		answer: "Лукашенко",
		isCorrect: true
	}, {
		answer: "Ельцин"
	}, {
		answer: "Сталин"
	}, {
		answer: "Путин"
	}],
	description: "Даже после смерти уго портреты будут висеть в школах и на заводах."
}, {
	question: "Как правильно закончить пословицу: «Не откладывай на завтра то, что можно…»?",
	answers: [{
		answer: "никогда не делать"
	}, {
		answer: "сделать послезавтра"
	}, {
		answer: "сделать сегодня",
		isCorrect: true
	}, {
		answer: "сделать через месяц"
	}]
}];

async function seed() {
	await mongoose.connect(config.get("db.uri"), config.get("db.options"));

	await Patch.deleteMany({});
	await User.deleteMany({});
	await Test.deleteMany({});

	await new Patch(patch).save();

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	const newUser = await new User(user).save();

	const newTests = tests.map(t => ({
		...t,
		author: {
			author: newUser._id,
			name: newUser.name
		}
	}));
	await Test.insertMany(newTests);

	mongoose.disconnect();

	debug("Done!");
}

seed();