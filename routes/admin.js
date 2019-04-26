const express = require("express");
const router = express.Router();
const { User } = require("../models/user");

const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");

const getPermission = require("../permission/getPermission");
const { UPandDOWNGRADE_USERS } = require("../permission/actions");

const debug = require("debug")("node:admin");

router.get("/users", auth(UPandDOWNGRADE_USERS), async (req, res) => {
	debug("Trying to get users...");
	const users = await User.find();

	res.send({
		users,
		permission: ["user", "moderator"]
	});
	debug("Users send");
});

router.patch(
	"/users/:id",
	[auth(UPandDOWNGRADE_USERS), validateObjectId],
	async (req, res) => {
		debug("Trying to patch user...");
		const permission = getPermission(req.body.permission);
		debug(req.body.permission);
		const user = await User.findByIdAndUpdate(req.params.id, {
			permission
		});

		res.send(user);
		debug("User patched");
	}
);

module.exports = router;
