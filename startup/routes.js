const express = require("express");
const tests = require("../routes/tests");
const editor = require("../routes/editor");
const releases = require("../routes/patches");
const users = require("../routes/users");
const admin = require("../routes/admin");

module.exports = function (app) {
    app.use(express.json());
    app.use("/api/v1/tests", tests);
    app.use("/api/v1/editor", editor);
    app.use("/api/v1/patches", releases);
    app.use("/api/v1/users", users);
    app.use("/api/v1/admin", admin);
}