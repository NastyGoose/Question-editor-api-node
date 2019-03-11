const Joi = require("joi");

function release(patch, context) {
	const schema = {
		description: Joi.string().min(3)
	};

	return Joi.validate(patch, schema, {
		context
	});
}

module.exports = {
	release
};