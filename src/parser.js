"use strict";
let peg = require("pegjs");
let fs = require("fs");
let path = require("path");
let parser = null;

try {
    let grammar = fs.readFileSync(path.join(__dirname, "grammar.peg"), "utf-8");
    parser = peg.buildParser(grammar);
} catch (err) {
    console.log("Error Building Parser", err);
    throw err;
}


class Parser {
    parse(input) {
        return parser.parse(input);
    }
}

module.exports = Parser;
