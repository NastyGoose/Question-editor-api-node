const express = require("express");
const router = express.Router();
const {
    Test
} = require("../models/test");
const validateObjectId = require("../middleware/validateObjectId");

const debug = require("debug")("node:tests");

router.get("/", async (req, res) => {
    debug("Trying to get");
    const tests = await Test.find();

    res.send(tests);
    debug("Tests sended");
});

router.delete("/:id", [validateObjectId], async (req, res) => {
    debug("Trying to delete with id");
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).send("The test was not found.");

    res.send(test);
    debug(`The test with id: ${test._id} was deleted`);
});

module.exports = router;