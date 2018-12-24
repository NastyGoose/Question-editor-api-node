const express = require("express");
const router = express.Router();
//const Fawn = require("fawn"); //TODO: use transactions in some cases
const {
	Test
} = require("../models/test");
const {
	User
} = require("../models/user");
const {
	Patch
} = require("../models/patch");

const testValidator = require("../validator/validateTest");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const validateDocument = require("../middleware/validateDocument");
const getRandomId = require("../middleware/getRandomId");
const dbQueryBuilder = require("../common/dbQuery/dbQueryBuilder");

const checkUnswers = require("../common/checkUnswers");
const debug = require("debug")("node:tests");
const config = require("config");

router.get("/", async (req, res) => {
	debug("Trying to get tests");
	const pageSize = config.get("page.size");
	const filter = config.get("query.filter");
	const sort = config.get("query.sort");

	const query = dbQueryBuilder.filterTests(req.query[filter].split(" "));
	const sorter = dbQueryBuilder.sortTests(req.query[sort]);

	const tests = await Test
		.find(query)
		.sort(sorter)
		.skip((req.query.page - 1) * pageSize)
		.limit(pageSize)
		.populate("patch", "name")
		.select("-__v -description -answers");

	let patch = await Patch.findOne({
		dateRelease: {
			$eq: null
		}
	}).select("_id");

	if (!patch) patch = "All patches was released.";

	res.send({
		tests,
		patch
	});
	debug("Tests sended");
});

router.get("/:id", [validateObjectId], async (req, res) => {
	debug(`Trying to get test with id: ${req.params.id}`);
	const test = await Test.findById(req.params.id);
	if (!test) req.status(404).send("Test was not found.");

	res.send(test);
	debug(`Test was send with id: ${test._id}`);
});

function randomCondition(compareArg) {
	return compareArg === "random";
}

//TODO: add Fawn
router.put("/:id", [
	getRandomId(Test, randomCondition),
	validateObjectId
], async (req, res) => {
	debug(`Trying to get test with id: ${req.params.id}`);
	const test = await Test.findByIdAndUpdate(req.params.id, {
		$inc: {
			"visits": 1
		}
	}, {
		new: true
	});
	if (!test) req.status(404).send("Test was not found.");

	const user = await User.findById({
		_id: "5c18a4bc086d3702a4d04db3"
	}).select("tests");

	const result = user.tests.find(t => t.test.toString() === test._id.toString());
	if (!result)
		user.tests.push({
			test: test._id,
			isVisited: true
		});

	user.save();

	res.send(test);
	debug(`Test was send with id: ${test._id}`);
});

//TODO: make it with multiple answers
router.patch("/:id", [
	validateObjectId,
	validate(testValidator.answer, {
		update: true
	})
], async (req, res) => {
	debug("Trying to submit with id");

	const test = await Test.findOneAndUpdate({
		_id: req.params.id,
		"answers._id": req.body.answerId
	}, {
		$inc: {
			"answers.$.choiceCount": 1,
			"numberOfReplied": 1
		}
	}, {
		new: true
	});
	if (!test) return res.status(404).send("The test was not found.");

	const isAnsweredCorrectly = checkUnswers(test, req.body.answerId);
	await User.updateOne({
		_id: "5c18a4bc086d3702a4d04db3", // req.user.id in future
		"tests.test": test._id
	}, {
		$set: {
			"tests.$.answer.isAnswered": true,
			"tests.$.answer.isAnsweredCorrectly": isAnsweredCorrectly
		}
	});

	res.send(isAnsweredCorrectly);
	debug("Test was submited.");
});

router.patch("/rating/:id", [validateObjectId], async (req, res) => {
	debug("Trying to rate test");
	const user = await User.findById("5c18a4bc086d3702a4d04db3");
	// const result = (req.query.action === "like" &&
	//         user.like(req.params.id)) ||
	//     (req.query.action === "dislike" &&
	//         user.dislike(req.params.id));
	const result = user.rate(req.params.id, req.query.action);
	if (!result) return res.status(404).send("Invalid operation.");
	await user.save();

	const test = await Test.findOneAndUpdate({
		_id: req.params.id,
	}, {
		$inc: {
			"likes": result.like,
			"dislikes": result.dislike
		},
	}, {
		new: true
	});
	if (!test) return res.status(404).send("The test was not found.");

	res.send({
		likes: test.likes,
		dislikes: test.dislikes
	});
	debug("Test was updated.");
});

router.delete("/:id", [validateObjectId], async (req, res) => {
	debug("Trying to delete with id");
	const test = await Test.findByIdAndDelete(req.params.id);
	if (!validateDocument(res, test)) return;

	res.send(test);
	debug(`The test with id: ${test._id} was deleted`);
});

module.exports = router;