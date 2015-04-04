"use strict";
let peg = require("pegjs");
let fs = require("fs");
let path = require("path");
let grammar = fs.readFileSync(path.join(__dirname, "grammar.peg"), "utf-8");
let parser = peg.buildParser(grammar);

class Parser {
    parse(input) {
        return parser.parse(input);
    }
}

module.exports = Parser;
