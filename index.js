"use strict";
var Parser = require("./dist/parser");
var Walker = require("./dist/walker");
var Executor = require("./dist/executor");
var Runner = require("./dist/http-runner");

module.exports = function (agent) {
    return new Walker(new Parser(), new Executor(new Runner(agent)));
} ;
