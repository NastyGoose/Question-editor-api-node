const {
	zipObject
} = require("lodash");

module.exports = function(sortQuery) {
	return zipObject(["path", "order"], sortQuery.split(":"));
};