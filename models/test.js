const Joi = require("joi");
const mongoose = require("mongoose");
const debug = require("debug")("node:test-model");

const options = {
    maxCorrectAnswers: 1,
    minAnswers: 2,
    maxAnswers: 8
}

const Answer = {
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
}

const Test = mongoose.model("Tests", new mongoose.Schema({
    question: {
        type: String,
        required: [true, "You should think about question."],
        minlength: [3, "Question is too small, you should type at least 3 characters."],
        maxlength: [255, "Question is to big, max length is 255."]
    },
    answers: {
        type: [Answer],
        required: [true, "You should type an answer."],
        validate: [{
            isAsync: true,
            validator: (e) => validateCorrectAnswers(e, options.maxCorrectAnswers),
            message: `Should be at least ${options.maxCorrectAnswers} correct answer.`
        }, {
            isAsync: true,
            validator: (e) => arrayLimit(e, options.minAnswers, options.maxAnswers),
            message: `You should have more then ${options.minAnswers} and less then ${options.maxAnswers} answers.`
        }]
    },
    likes: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: Number,
        default: 0
    },
    visits: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: "",
        maxlength: 255
    }
}));

validateCorrectAnswers = (e, num) => {
    let correctAnswersCount = 0;
    for (let i = 0; i < e.length; i++) {
        if (e[i].isCorrect) correctAnswersCount++;
    }
    return correctAnswersCount === num;
}

arrayLimit = (e, min, max) => {
    return e.length >= min && e.length <= max;
}

function validateTest(test, context) {
    const {
        minAnswers,
        maxAnswers
    } = options;

    const answerSchema = {
        answer: Joi.string().required(),
        isCorrect: Joi.boolean().insensitive(false),
        choiceCount: Joi.number().default(0)
    }

    const schema = {
        question: Joi.string().min(3).max(255).when(Joi.ref("$update"), {
            is: Joi.boolean().valid(true).required(),
            then: Joi.optional(),
            otherwise: Joi.required(),
        }),
        answers: Joi.array()
            .items(Joi.object().keys(answerSchema))
            .min(minAnswers)
            .max(maxAnswers),
        likes: Joi.number().default(0),
        dislikes: Joi.number().default(0),
        visits: Joi.number().default(0),
        description: Joi.string().min(3).max(255).default("")
    };

    return Joi.validate(test, schema, {
        context
    });
}

exports.Test = Test;
exports.validator = validateTest;