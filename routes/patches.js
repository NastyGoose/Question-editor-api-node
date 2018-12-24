const express = require("express");
const router = express.Router();
const {
	Test
} = require("../models/test");
const {
	Patch,
	validator,
	actions
} = require("../models/patch");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");
const patchValidator = require("../validator/validatePatch");
const getLastReleaseId = require("../middleware/getFirstReleaseId");

const fs = require("fs");
const {
	size,
	flattenDeep
} = require("lodash");
const debug = require("debug")("node:patches");

router.get("/", async (req, res) => {
	debug("Trying to get patches");
	const patches = await Patch.find();

	res.send(patches);
	debug("Patches was got");
});

router.get("/:id", validateObjectId, async (req, res) => {
	debug("Trying to get patch");
	const patch = await Patch.findById(req.params.id).select("-__v");

	const tests = await Test.find({
		patch: patch._id
	}).select("-description -answers -__v");

	res.send({
		patch,
		tests
	});
	debug("Patch was got");
});

router.post("/", [validate(validator)], async (req, res) => {
	debug("Trying to post patch");
	const {
		action,
		description
	} = req.body;

	const oldPatch = await Patch.findOne().sort({
		dateCreation: -1
	});
	if (!oldPatch.dateRelease) return res.status(400).send("Previous patch was not released.");
	const lastPatch = oldPatch.name.split(".");

	const actionNum = actions[action];
	let newPatchPart = parseInt(lastPatch[actionNum], 10) + 1;
	if (newPatchPart < 10) newPatchPart = `0${newPatchPart.toString()}`;
	else newPatchPart = newPatchPart.toString();
	lastPatch[actionNum] = newPatchPart;

	for (let i = actionNum + 1; i < size(actions); i++)
		lastPatch[i] = "00";

	const newPatchName = lastPatch.join(".");

	const patch = new Patch({
		name: newPatchName,
		description
	});

	await patch.save();

	res.send(patch);
	debug("Patch posted");
});

router.get("/not-released", [
	validate(patchValidator.release)
], async (req, res) => {
	debug("Trying to get patch");
	const patch = await Patch.findOne({
		dateRelease: {
			$eq: null
		}
	});
	if (!patch) return res.status(400).send("All patches are already released.");

	res.send(patch);
	debug("Patch was got");
});

router.patch("/not-released", [
	validate(patchValidator.release)
], async (req, res) => {
	debug("Trying to release patch");
	const patch = await Patch.findOne({
		dateRelease: {
			$eq: null
		}
	});
	if (!patch) return res.status(400).send("All patches are already released.");
	patch.release(req.body.description);
	await patch.save();

	res.send(patch);
	debug("Patch was released");
});

router.patch("/not-released/tests/:id", validateObjectId, async (req, res) => {
	debug("Trying to add test in patch");
	const patch = await Patch.findOneAndUpdate({
		dateRelease: {
			$eq: null
		},
		tests: {
			$ne: req.params.id
		}
	}, {
		$push: {
			tests: req.params.id
		}
	}, {
		new: true
	});
	if (!patch) return res.status(400).send("Adding tests to released patches and to patches that already contains test is not allowed.");

	const test = await Test.findByIdAndUpdate(req.params.id, {
		$set: {
			patch: patch._id
		}
	}, {
		new: true
	});

	res.send({
		patch,
		test
	});
	debug("Test was added");
});

router.delete("/not-released/tests/:id", validateObjectId, async (req, res) => {
	debug("Trying to delete test in patch");
	const patch = await Patch.findOneAndUpdate({
		dateRelease: {
			$eq: null
		}
	}, {
		$pull: {
			tests: req.params.id
		}
	}, {
		new: true
	});
	if (!patch) return res.status(400).send("Deleting tests from released patches is not allowed.");

	const test = await Test.findByIdAndUpdate(req.params.id, {
		$unset: {
			patch: ""
		}
	}, {
		new: true
	});

	res.send({
		patch,
		test
	});
	debug("Test was deleted");
});

router.delete("/not-released", async (req, res) => {
	debug("Trying to delete patch");
	const patch = await Patch.findOneAndRemove({
		dateRelease: {
			$eq: null
		}
	});
	if (!patch) return res.status(400).send("Deleting released patches is not allowed.");

	res.send(patch);
	debug("Patch was deleted");
});

function condition(compareArg) {
	return compareArg === "new";
}

router.get("/download/:id", [
	getLastReleaseId(condition),
	validateObjectId
], async (req, res) => {
	debug("Trying to download patch");
	const patch = await Patch.findById(req.params.id);
	if (!patch) return res.status(404).send("Patch was not found.");

	const patches = await Patch.find({
		dateRelease: {
			$gt: patch.dateRelease
		}
	});

	const testsId = flattenDeep(patches.map(p => p.tests)).map(t => {
		return {
			_id: t
		};
	});

	const tests = await Test
		.find()
		.or(testsId)
		.select("-_id question answers.isCorrect answers._id answers.answer");

	const fileLocation = ".//uploads//tests.json";

	fs.writeFile(fileLocation, JSON.stringify(tests), function(err) {
		if (err) {
			debug(err);
		}
		debug("Saved!");
		res.download(fileLocation);
		debug("Patch was downloaded");
	});
});

module.exports = router;