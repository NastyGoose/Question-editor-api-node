const express = require("express");
const router = express.Router();
const {
	User,
	validator
} = require("../models/user");

const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

const {
	GET_USER_PROFILE,
	GET_OWN_PROFILE
} = require("../permission/actions");

const filterTests = require("../common/filter/filterTests");
const sortTests = require("../common/sort/sortTests");
const paginate = require("../common/paginate");

const bcrypt = require("bcrypt");
const {
	pick
} = require("lodash");

const config = require("config");
const debug = require("debug")("node:users");

router.get("/", auth(GET_USER_PROFILE), async (req, res) => {
	debug("Trying to get users...");
	const users = await User.find();

	res.send(users);
	debug("Users send");
});

router.post("/", validate(validator), async (req, res) => {
	debug("Trying to post user...");
	let user = await User.findOne({
		email: req.body.email
	});
	if (user) return res.status(400).send("User already registered.");

	user = new User(pick(req.body, ["name", "email", "password"]));
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save();
	debug(user);
	const token = user.generateAuthToken();
	res
		.header("x-auth-token", token)
		.header("access-control-expose-headers", "x-auth-token")
		.send(pick(user, ["_id", "name", "email", "reputation"]));
	debug("New user was created");
});

router.get("/profile", auth(GET_OWN_PROFILE), async (req, res) => {
	debug("Trying to get profile...");
	const user = await getUser(req.user._id); // you can use other mongoose methods
	if (!user) return res.status(404).send("User not found");

	res.send(user);
	debug("Profile got");
});

router.get("/:id", [
	auth(GET_USER_PROFILE),
	validateObjectId
], async (req, res) => {
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
router.get("/profile/tests", auth(GET_OWN_PROFILE), async (req, res) => {
	debug("Trying to get user tests...");
	const pageSize = config.get("page.size");
	const filter = config.get("query.filter");
	const sort = config.get("query.sort");
	const page = config.get("page.name");

	const user = await User.findById(req.user._id)
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

router.put("/profile", [
	auth(GET_OWN_PROFILE),
	validate(validator)
], async (req, res) => {
	debug("Trying to put user with id");
	const user = await User.findByIdAndUpdate(
		req.user._id,
		req.body, {
			new: true
		});
	if (!user) return res.status(404).send("The user with the given ID was not found.");

	res.send(user);
	debug("User was updated.");
});

module.exports = router;