const express = require("express");
const tests = require("../routes/tests");
const editor = require("../routes/editor");

module.exports = function (app) {
    app.use(express.json());
    app.use("/api/tests", tests);
    app.use("/api/editor", editor);
}