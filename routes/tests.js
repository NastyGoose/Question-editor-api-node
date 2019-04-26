const express = require("express");
const router = express.Router();
//const Fawn = require("fawn"); //TODO: use transactions in some cases
const { Test } = require("../models/test");
const { User } = require("../models/user");
const { Patch } = require("../models/patch");

const testValidator = require("../validator/validateTest");

const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const validateDocument = require("../middleware/validateDocument");
const getRandomId = require("../middleware/getRandomId");
const auth = require("../middleware/auth");

const {
	ANSWER_TEST,
	RATE_TESTS,
	VERIFY_TESTS,
	DELETE_TESTS
} = require("../permission/actions");

const dbQueryBuilder = require("../common/dbQuery/dbQueryBuilder");
const checkUnswers = require("../common/checkUnswers");

const debug = require("debug")("node:tests");
const config = require("config");

router.get("/", async (req, res) => {
	debug("Trying to get tests");
	const pageSize = config.get("page.size");
	const filter = config.get("query.filter");
	const sort = config.get("query.sort");

	let query = {};
	let sorter = {};
	if (req.query[filter]) {
		query = dbQueryBuilder.filterTests(req.query[filter].split(" "));
	}
	if (req.query[sort]) {
		sorter = dbQueryBuilder.sortTests(req.query[sort]);
	}

	const tests = await Test.find(query)
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
router.put(
	"/:id",
	[auth(ANSWER_TEST), getRandomId(Test, randomCondition), validateObjectId],
	async (req, res) => {
		debug(`Trying to get test with id: ${req.params.id}`);
		const test = await Test.findByIdAndUpdate(
			req.params.id,
			{
				$inc: {
					visits: 1
				}
			},
			{
				new: true
			}
		);
		if (!test) return res.status(404).send("Test was not found.");
		//if (!req.user) return res.send(test);

		const user = await User.findById(req.user._id).select("tests");

		const result = user.tests.find(
			t => t.test.toString() === test._id.toString()
		);
		if (!result) {
			user.tests.push({
				test: test._id,
				isVisited: true
			});
		} else {
			result.isVisited = true;
		}

		user.save();

		res.send({ test, result });
		debug(`Test was send with id: ${test._id}`);
	}
);

//TODO: make it with multiple answers
router.patch(
	"/:id",
	[
		auth(ANSWER_TEST),
		validateObjectId,
		validate(testValidator.answer, {
			update: true
		})
	],
	async (req, res) => {
		debug("Trying to submit with id");
		const test = await Test.findOneAndUpdate(
			{
				_id: req.params.id,
				"answers._id": req.body.answerId
			},
			{
				$inc: {
					"answers.$.choiceCount": 1,
					numberOfReplied: 1
				}
			},
			{
				new: true
			}
		);
		if (!test) return res.status(404).send("The test was not found.");

		const isAnsweredCorrectly = checkUnswers(test, req.body.answerId);
		if (!req.user)
			return res.send({
				isAnsweredCorrectly,
				correctAnswer: test.answers.find(t => t.isCorrect === true),
				description: test.description
			});

		await User.updateOne(
			{
				_id: req.user._id,
				"tests.test": test._id
			},
			{
				$set: {
					"tests.$.answer.isAnswered": true,
					"tests.$.answer.isAnsweredCorrectly": isAnsweredCorrectly
				}
			}
		);

		res.send({
			isAnsweredCorrectly,
			correctAnswer: test.answers.find(t => t.isCorrect === true),
			description: test.description
		});
		debug("Test was submited.");
	}
);

router.patch(
	"/rating/:id",
	[auth(RATE_TESTS), validateObjectId],
	async (req, res) => {
		debug("Trying to rate test");
		const user = await User.findById(req.user._id);
		// const result = (req.query.action === "like" &&
		//         user.like(req.params.id)) ||
		//     (req.query.action === "dislike" &&
		//         user.dislike(req.params.id));
		const result = user.rate(req.params.id, req.query.action);
		if (!result) return res.status(404).send("Invalid operation.");
		await user.save();

		const test = await Test.findOneAndUpdate(
			{
				_id: req.params.id
			},
			{
				$inc: {
					likes: result.like,
					dislikes: result.dislike
				}
			},
			{
				new: true
			}
		);
		if (!test) return res.status(404).send("The test was not found.");

		res.send({
			likes: test.likes,
			dislikes: test.dislikes
		});
		debug("Test was updated.");
	}
);

router.patch(
	"/verify/:id",
	[auth(VERIFY_TESTS), validateObjectId],
	async (req, res) => {
		debug("Trying to verifie with id");
		const test = await Test.findByIdAndUpdate(req.params.id, {
			verified: true
		});
		if (!validateDocument(res, test)) return;

		res.send({
			verified: true
		});
		debug(`The test with id: ${test._id} was verified`);
	}
);

router.patch(
	"/unverify/:id",
	[auth(VERIFY_TESTS), validateObjectId],
	async (req, res) => {
		debug("Trying to verifie with id");
		const test = await Test.findByIdAndUpdate(req.params.id, {
			verified: false
		});
		if (!validateDocument(res, test)) return;

		res.send({
			verified: false
		});
		debug(`The test with id: ${test._id} was verified`);
	}
);

router.delete(
	"/:id",
	[auth(DELETE_TESTS), validateObjectId],
	async (req, res) => {
		debug("Trying to delete with id");
		const test = await Test.findOneAndRemove({
			_id: req.params.id,
			verified: false,
			patch: {
				$eq: null
			}
		});
		if (!validateDocument(res, test)) return;

		await User.updateMany(
			{},
			{
				$pull: {
					tests: test._id
				}
			}
		);

		res.send(test);
		debug(`The test with id: ${test._id} was deleted`);
	}
);

module.exports = router;
