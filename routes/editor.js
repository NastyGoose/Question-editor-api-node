const express = require("express");
const router = express.Router();
const {
    Test,
    validator
} = require("../models/test");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");

const debug = require("debug")("node:editor");
const getCurrentTime = require("../utils/getCurrentTime");
const removeUndefined = require("../utils/removeUndefined");

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
        likes,
        dislikes,
        visits,
        description
    } = req.body;
    const test = new Test({
        question,
        answers,
        likes,
        dislikes,
        visits,
        description
    }); // or simply use req.body
    await test.save();

    res.send(test);
    debug(`Created test: ${question} - ${getCurrentTime()}`);
});

router.patch("/:id", [validateObjectId, validate(validator, {
    update: true
})], async (req, res) => {
    debug("Trying to patch with id");
    const {
        likes,
        dislikes,
        visits
    } = req.body;

    const updatedData = removeUndefined({
        likes: likes,
        dislikes: dislikes,
        visits: visits
    });

    const test = await Test.findOneAndUpdate({
        _id: req.params.id
    }, {
        $set: updatedData
    }, {
        new: true
    });
    if (!test) return res.status(404).send("The test was not found.")

    res.send(test);
    debug("Test was updated.");
});

router.put("/:id", [validateObjectId, validate(validator)], async (req, res) => {
    debug("Trying to put with id");
    const test = await Test.findOneAndUpdate({
        _id: req.params.id
    }, req.body, {
        new: true
    });
    if (!test) return res.status(404).send("The test with the given ID was not found.");

    res.send(test);
    debug("Test was updated.");
});

module.exports = router;