const jwt = require("jsonwebtoken");
const config = require("config");
const debug = require("debug")("node:middleware");

module.exports = (...permission) => {
	return (req, res, next) => {
		if (!config.get("requiresAuth")) return next();
		const token = req.header("x-auth-token");
		if (!token) return res.status(401).send("Access denied. No token provided.");

		try {
			const decode = jwt.verify(token, config.get("jwtPrivateKey"));
			debug(decode.permission & permission[0] ? "passed" : "denied");
			if (!(decode.permission & permission[0]))
				return res.status(403).send("Access denied.");
			const secondFactor = permission.map(p => !!(p & decode.permission));
			req.permission = [...secondFactor];

			req.user = decode;
			next();
		} catch (ex) {
			res.status(400).send("Invalid token");
		}
	};
};