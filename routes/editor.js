const express = require("express");
const router = express.Router();
const {
	Test,
	validator
} = require("../models/test");
const {
	User
} = require("../models/user");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");

const debug = require("debug")("node:editor");
const getCurrentTime = require("../utils/time/getCurrentTime");

router.get("/:id", [validateObjectId], async (req, res) => {
	debug("Trying to get with id");
	const {
		id
	} = req.params;
	const test = await Test.findById(id);
	if (!test) return res.status(404).send("The test with the given ID was not found.");

	res.send(test);
	debug(`Send test with id: ${id} - ${getCurrentTime()}`);
});

router.post("/", [validate(validator)], async (req, res) => {
	debug("Trying to post");
	const {
		question,
		answers,
		description
	} = req.body;
	const test = new Test({
		question,
		answers,
		author: {
			author: "5c18a4d3086d3702a4d04db4",
			name: "Val"
		},
		description
	});
	await test.save();

	const user = await User.findById("5c18a4d3086d3702a4d04db4");

	user.tests.push({
		test: test._id,
		isMine: true
	});

	user.save();

	res.send(test);
	debug(`Created test: ${question} - ${getCurrentTime()}`);
});

router.put("/:id", [validateObjectId, validate(validator)], async (req, res) => {
	debug("Trying to put with id");
	const test = await Test.findOneAndUpdate({
		_id: req.params.id,
		verified: false,
		patch: {
			$eq: null
		},
		"author.author": req.user._id
	}, req.body, {
		new: true
	});
	if (!test) return res.status(404).send("The test can't be modified after being verified or patched.");

	res.send(test);
	debug("Test was updated.");
});

module.exports = router;