const validateObjectId = require("../validator/validateObjectId");
const debug = require("debug")("node:middleware");

module.exports = function(req, res, next) {
	debug(`Validating id: ${req.params.id}...`);
	if (!validateObjectId(req.params.id))
		return res.status(404).send("Invalid ID.");

	next();
};