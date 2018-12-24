const debug = require("debug")("node:utils");

module.exports = function(tests, queryString) {
	if (!queryString) return tests;
	const query = queryString.split(" ");
	const filter = require("./filter").filter(tests, query);
	const result = filter.filterField("isMine", "my")
		.filterField("isVisited", "visited")
		.filterField("isLiked", "liked")
		.filterField("isDisliked", "disliked")
		.filterField("isAnwered", "answered")
		.filterField("isAnsweredCorrectly", "answered-correctly")
		.filterField("test.verified", "verified").result();

	debug(`Filtered by "${query.join(", ")}"`);
	return result;
};