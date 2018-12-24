const {
	orderBy,
	camelCase
} = require("lodash");
const getSortQuery = require("./getSortQuery");
const debug = require("debug")("node:utils");

module.exports = function(tests, sortQuery) {
	// path can be only like names of tests fields,
	// so use only likes, dislikes, visits, number_of_replied
	// camelCase method works fine
	if (!sortQuery) return tests;
	const {
		path,
		order
	} = getSortQuery(sortQuery);
	const sorted = orderBy(tests, [`test.${camelCase(path)}`], [order]);

	debug(`Sorted by "${camelCase(path)}" in "${order}" order`);
	return sorted;
};