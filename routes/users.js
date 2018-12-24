const express = require("express");
const router = express.Router();
const {
	User,
	validator
} = require("../models/user");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const bcrypt = require("bcrypt");
const {
	pick
} = require("lodash");

const filterTests = require("../common/filter/filterTests");
const sortTests = require("../common/sort/sortTests");
const paginate = require("../common/paginate");
const config = require("config");

const debug = require("debug")("node:users");

router.get("/", async (req, res) => {
	debug("Trying to get users...");
	const users = await User.find();

	res.send(users);
	debug("Users send");
});

router.post("/", [validate(validator)], async (req, res) => {
	debug("Trying to post user...");
	let user = await User.findOne({
		email: req.body.email
	});
	if (user) return res.status(400).send("User already registered.");

	user = new User(pick(req.body, ["name", "email", "password"]));
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save();

	res.send(pick(user, ["_id", "name", "email"]));
	debug("New user was created");
});

router.get("/profile", async (req, res) => {
	debug("Trying to get profile...");
	const user = await getUser("5c18a4bc086d3702a4d04db3"); // you can use other mongoose methods
	if (!user) return res.status(404).send("User not found");

	res.send(user);
	debug("Profile got");
});

router.get("/:id", [validateObjectId], async (req, res) => {
	debug("Trying to get user...");
	const user = await getUser(req.params.id);
	if (!user) return res.status(404).send("User not found");

	res.send(user);
	debug("User send");
});

function getUser(id) {
	return User.findById(id).select("-password -__v");
}
// 5c18a4bc086d3702a4d04db3
router.get("/profile/tests", async (req, res) => {
	debug("Trying to get user tests...");
	const pageSize = config.get("page.size");
	const filter = config.get("query.filter");
	const sort = config.get("query.sort");
	const page = config.get("page.name");

	const user = await User.findById("5c18a4bc086d3702a4d04db3")
		.populate({
			path: "tests.test",
			select: "-__v -answers -description"
		});

	const tests = user.tests;
	const filtered = filterTests(tests, req.query[filter]);
	const sorted = sortTests(filtered, req.query[sort]);
	const paged = paginate(sorted, req.query[page], pageSize);

	res.send(paged);
	debug("Tests sended");
});

router.put("/profile", [validate(validator)], async (req, res) => {
	debug("Trying to put user with id");
	const user = await User.findByIdAndUpdate(
		"5c18a4bc086d3702a4d04db3",
		req.body, {
			new: true
		});
	if (!user) return res.status(404).send("The user with the given ID was not found.");

	res.send(user);
	debug("User was updated.");
});

module.exports = router;