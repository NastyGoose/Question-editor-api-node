const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = function(id) {
	return ObjectId(id);
};