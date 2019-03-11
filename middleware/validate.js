module.exports = (validator, context) => {
	return (req, res, next) => {
		const {
			error
		} = validator(req.body, context);
		if (error) return res.status(400).send(error.details[0].message);
		next();
	};
};