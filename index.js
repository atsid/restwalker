"use strict";
let Parser = require("./dist/parser");
let Walker = require("./dist/walker");
let Executor = require("./dist/executor");
let Runner = require("./dist/http-runner");
module.exports = (agent) => new Walker(new Parser(), new Executor(agent));
