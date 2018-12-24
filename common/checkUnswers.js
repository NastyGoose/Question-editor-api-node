module.exports = function({
	answers
}, ...answersId) {
	const selectedAnswers = answers.filter(a => {
		for (let i = 0; i < answersId.length; i++)
			if (a._id == answersId[i]) return true;

		return false;
	});

	const correctAnswers = answers.filter(a => a.isCorrect === true);


	for (let i = 0; i < selectedAnswers.length; i++)
		if (!selectedAnswers[i].isCorrect || selectedAnswers.length < correctAnswers.length) return false;

	return true;
};