const Joi = require("joi");

function validateAnswer(test, context) {
	const schema = {
		answerId: Joi.objectId().required()
	};

	return Joi.validate(test, schema, {
		context
	});
}

module.exports = {
	answer: validateAnswer
};