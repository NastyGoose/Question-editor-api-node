const Joi = require("joi");

module.exports = function(req) {
	const schema = {
		permission: Joi.any().map({
			user: 0,
			moderator: 1
		}).required(),
	};

	return Joi.validate(req, schema);
};