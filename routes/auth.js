const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const validatorAuth = require("../validator/validateAuth");
const validate = require("../middleware/validate");
const debug = require("debug")("node:auth");

router.post("/", validate(validatorAuth), async (req, res) => {
	debug("Trying to authorize");
	const user = await User.findOne({
		email: req.body.email
	});
	if (!user) return res.status(400).send("Invalid email or password.");

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).send("invalid email or password.");

	const token = user.generateAuthToken();
	res.send(token);
	debug("Authorized");
});

module.exports = router;
