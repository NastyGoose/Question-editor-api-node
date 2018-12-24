const debug = require("debug")("node:middleware");
const {
	Patch
} = require("../models/patch");

module.exports = condition => {
	return async function(req, res, next) {
		if (!condition(req.params.id)) return next();
		debug("Get last release id");
		const {
			_id
		} = await Patch.findOne().sort({
			dateRelease: 1
		}).select("_id");
		req.params.id = _id;

		debug(`Last release id: ${req.params.id}`);
		next();
	};
};