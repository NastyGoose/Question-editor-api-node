const BaseJoi = require("joi");
const Maps = require("joi-enums-extension");
const Joi = BaseJoi.extend(Maps);
const mongoose = require("mongoose");

const patchSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		validate: {
			validator: function(v) {
				return /^\d{2}\.\d{2}\.\d{2}$/.test(v);
			},
			message: props => `${props.value} is not a valid patch name, it should be like "00.00.00"!`
		},
		required: true
	},
	description: {
		type: String,
		minlength: 3,
		maxlength: 255,
		required: true
	},
	dateRelease: {
		type: Date
	},
	dateCreation: {
		type: Date,
		required: true,
		default: Date.now
	},
	tests: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Tests"
	}]
});

patchSchema.methods.release = function(description) {
	this.dateRelease = new Date();
	if (description) this.description = description;
};

const Patch = mongoose.model("Patch", patchSchema);

function validatePatch(patch, context) {
	const schema = {
		action: Joi.any().map({
			new: 0,
			add: 1,
			fix: 2
		}).required(),
		description: Joi.string().min(3).max(255).required(),
		date: Joi.date()
	};

	return Joi.validate(patch, schema, {
		context
	});
}

const actions = {
	new: 0,
	add: 1,
	fix: 2
};

exports.actions = actions;
exports.Patch = Patch;
exports.validator = validatePatch;