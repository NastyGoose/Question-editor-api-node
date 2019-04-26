const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const { user } = require("../permission/types");
const debug = require("debug")("node:user-model");

const testSchema = {
	test: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Tests",
		required: true
	},
	isMine: {
		type: Boolean,
		default: false
	},
	isVisited: {
		type: Boolean,
		default: false
	},
	answer: {
		isAnswered: {
			type: Boolean,
			default: false
		},
		isAnsweredCorrectly: {
			type: Boolean,
			default: false
		}
	},
	isLiked: {
		type: Boolean,
		default: false
	},
	isDisliked: {
		type: Boolean,
		default: false
	}
};

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 50
	},
	email: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255,
		unique: true
	},
	password: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 1024
	},
	reputation: {
		type: Number,
		default: 0
	},
	tests: {
		type: [testSchema]
	},
	permission: {
		type: Number,
		default: user
	}
});

userSchema.methods.generateAuthToken = function() {
	const token = jwt.sign(
		{
			_id: this._id,
			name: this.name,
			email: this.email,
			reputation: this.reputation,
			permission: this.permission
		},
		config.get("jwtPrivateKey")
	);
	return token;
};

userSchema.methods.rate = function(testId, action) {
	const index = this.tests.findIndex(t => t.test.toString() === testId);
	if (index === -1)
		this.tests.push({
			test: test._id
		});
	const test = { ...this.tests[index]._doc }; // Some problems with "this", so used field _doc
	const { isLiked, isDisliked } = test;
	let { like, dislike } = {
		like: 0,
		dislike: 0
	}; // -1 is decrement value, 0 - nothing and 1 - increment

	switch (action) {
		case "like":
			if (!isLiked && !isDisliked) {
				test.isLiked = true;
				like = 1;
				break;
			}

			if (isLiked && !isDisliked) {
				test.isLiked = false;
				like = -1;
				break;
			}

			if (!isLiked && isDisliked) {
				test.isLiked = true;
				test.isDisliked = false;
				like = 1;
				dislike = -1;
				break;
			}

			test.isDisliked = false;
			dislike = -1;

			break;
		case "dislike":
			debug(isLiked, isDisliked);
			if (!isLiked && !isDisliked) {
				test.isDisliked = true;
				dislike = 1;
				break;
			}

			if (!isLiked && isDisliked) {
				test.isDisliked = false;
				dislike = -1;
				break;
			}

			if (isLiked && !isDisliked) {
				test.isLiked = false;
				test.isDisliked = true;
				like = -1;
				dislike = 1;
				break;
			}

			test.isLiked = false;
			like = -1;

			break;
		default:
			return;
	}

	this.tests[index] = test;

	return {
		like,
		dislike
	};
};

userSchema.methods.like = function(testId) {
	const index = this.tests.findIndex(t => t.testId.toString() === testId);
	if (index === -1) return;
	const test = { ...this.tests[index]._doc }; // Some problems with "this", so used field _doc
	const { isLiked, isDisliked } = test;
	let { like, dislike } = {
		like: 0,
		dislike: 0
	}; // -1 is decrement value, 0 - nothing and 1 - increment

	if (!isLiked && !isDisliked) {
		test.isLiked = true;
		like = 1;
	}

	if (isLiked && !isDisliked) {
		test.isLiked = false;
		like = -1;
	}

	if (!isLiked && isDisliked) {
		test.isLiked = true;
		test.isDisliked = false;
		like = 1;
		dislike = -1;
	}

	this.tests[index] = test;
	return {
		like,
		dislike
	};
};

userSchema.methods.dislike = function(testId) {
	const index = this.tests.findIndex(t => t.testId.toString() === testId);
	if (index === -1) return;
	const test = { ...this.tests[index]._doc }; // Some problems with "this", so used field _doc
	const { isLiked, isDisliked } = test;
	let { like, dislike } = {
		like: 0,
		dislike: 0
	}; // -1 is decrement value, 0 - nothing and 1 - increment

	if (!isLiked && !isDisliked) {
		test.isDisliked = true;
		dislike = 1;
	}

	if (!isLiked && isDisliked) {
		test.isDisliked = false;
		dislike = -1;
	}

	if (isLiked && !isDisliked) {
		test.isLiked = false;
		test.isDisliked = true;
		like = -1;
		dislike = 1;
	}

	this.tests[index] = test;
	return {
		like,
		dislike
	};
};

const User = mongoose.model("Users", userSchema);

function validateUser(user) {
	const schema = {
		name: Joi.string()
			.min(2)
			.max(50)
			.required(),
		email: Joi.string()
			.min(5)
			.max(255)
			.required()
			.email(),
		password: Joi.string()
			.min(5)
			.max(255)
			.required()
	};

	return Joi.validate(user, schema);
}

exports.User = User;
exports.validator = validateUser;
