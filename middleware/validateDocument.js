module.exports = (res, doc, message, statusCode) => {
	if (!doc) {
		res.status(statusCode || 404).send(message || "Document was not found.");
		return false;
	}
	return true;
};