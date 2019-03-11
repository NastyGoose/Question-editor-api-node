const {
	guest,
	user,
	moderator,
	admin
} = require("../permission/types");

module.exports = function(permission) {
	if (permission === "guest")
		return guest;

	if (permission === "user")
		return user;

	if (permission === "moderator")
		return moderator;

	if (permission === "admin")
		return admin;
};