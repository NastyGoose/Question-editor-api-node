const debug = require("debug")("node:middleware");

module.exports = (Model, condition) => {
	return async function(req, res, next) {
		if (!condition(req.params.id)) return next();
		debug("Get random id");
		await Model.countDocuments().then(async count => {

			// Get a random entry
			const random = Math.floor(Math.random() * count);

			// Again query all users but only fetch one offset by our random #
			await Model.findOne().skip(random).select("_id").then(obj => {
				req.params.id = obj._id;
			});
		});

		debug(`New id: ${req.params.id}`);
		next();
	};
};