"use strict";
let Parser = require("./dist/parser");
let Walker = require("./dist/walker");

module.exports = new Walker(new Parser());
