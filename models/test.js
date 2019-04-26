const Joi = require("joi");
const mongoose = require("mongoose");

const options = {
	maxCorrectAnswers: 1,
	minAnswers: 2,
	maxAnswers: 8
};

const authorSchema = new mongoose.Schema({
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Users",
		required: true
	},
	name: {
		type: String,
		required: true
	}
});

const answerSchema = new mongoose.Schema({
	answer: {
		type: String,
		required: [true, "You should think about answer."],
		maxlength: [50, "Answer is too big, max length is 50."]
	},
	isCorrect: {
		type: Boolean,
		default: false
	},
	choiceCount: {
		type: Number,
		default: 0
	}
});

const Test = mongoose.model(
	"Tests",
	new mongoose.Schema({
		question: {
			type: String,
			required: [true, "You should think about question."],
			minlength: [
				3,
				"Question is too small, you should type at least 3 characters."
			],
			maxlength: [255, "Question is to big, max length is 255."]
		},
		answers: {
			type: [answerSchema],
			validate: [
				{
					isAsync: true,
					validator: e => validateCorrectAnswers(e, options.maxCorrectAnswers),
					message: `Should be at least ${
						options.maxCorrectAnswers
					} correct answer.`
				},
				{
					isAsync: true,
					validator: e => arrayLimit(e, options.minAnswers, options.maxAnswers),
					message: `You should have more then ${
						options.minAnswers
					} and less then ${options.maxAnswers} answers.`
				}
			]
		},
		author: {
			type: authorSchema,
			required: true
		},
		likes: {
			type: Number,
			min: 0,
			default: 0
		},
		dislikes: {
			type: Number,
			min: 0,
			default: 0
		},
		visits: {
			type: Number,
			min: 0,
			default: 0
		},
		numberOfReplied: {
			type: Number,
			min: 0,
			default: 0
		},
		description: {
			type: String,
			maxlength: 255,
			default: ""
		},
		verified: {
			type: Boolean,
			default: false
		},
		patch: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Patch"
		}
	})
);

const validateCorrectAnswers = (e, num) => {
	let correctAnswersCount = 0;
	for (let i = 0; i < e.length; i++) {
		if (e[i].isCorrect) correctAnswersCount++;
	}
	return correctAnswersCount === num;
};

const arrayLimit = (e, min, max) => {
	return e.length >= min && e.length <= max;
};

function validateTest(test, context) {
	const { minAnswers, maxAnswers } = options;

	const answerSchema = {
		answer: Joi.string().required(),
		isCorrect: Joi.boolean().default(false)
	};

	const schema = {
		question: Joi.string()
			.min(3)
			.max(255)
			.when(Joi.ref("$update"), {
				is: Joi.boolean()
					.valid(true)
					.required(),
				then: Joi.optional(),
				otherwise: Joi.required()
			}),
		answers: Joi.array()
			.items(Joi.object().keys(answerSchema))
			.min(minAnswers)
			.max(maxAnswers),
		description: Joi.string()
			.min(3)
			.max(255)
			.default(""),
		verified: Joi.boolean().default(false)
	};

	return Joi.validate(test, schema, {
		context
	});
}

exports.Test = Test;
exports.validator = validateTest;
