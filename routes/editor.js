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
const auth = require("../middleware/auth");

const {
	CREATEandCHANGE_TESTS,
	VERIFY_TESTS
} = require("../permission/actions");

const debug = require("debug")("node:editor");
const getCurrentTime = require("../utils/time/getCurrentTime");

router.get("/:id", [
	auth(CREATEandCHANGE_TESTS),
	validateObjectId
], async (req, res) => {
	debug("Trying to get with id");
	const {
		id
	} = req.params;
	const test = await Test.findById(id);
	if (!test) return res.status(404).send("The test with the given ID was not found.");

	res.send(test);
	debug(`Send test with id: ${id} - ${getCurrentTime()}`);
});

router.post("/", [
	auth(CREATEandCHANGE_TESTS, VERIFY_TESTS),
	validate(validator)
], async (req, res) => {
	debug("Trying to post");
	const {
		question,
		answers,
		description,
		verified
	} = req.body;
	const test = new Test({
		question,
		answers,
		author: {
			author: req.user._id,
			name: req.user.name
		},
		description,
		verified: req.permission[1] ? verified : false
	});
	await test.save();

	await User.updateOne({
		_id: req.user._id
	}, {
		$push: {
			tests: {
				test: test._id,
				isMine: true
			}
		}
	});

	res.send(test);
	debug(`Created test: ${question} - ${getCurrentTime()}`);
});

router.put("/:id", [
	auth(CREATEandCHANGE_TESTS, VERIFY_TESTS),
	validateObjectId,
	validate(validator)
], async (req, res) => {
	debug("Trying to put with id");
	if (!req.permission[1]) delete req.body.verified;
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