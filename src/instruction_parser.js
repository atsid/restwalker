"use strict";
let Instruction = require("./instruction");
let Step = require("./step");

let parsePathStep = (input) => new Step(input);

/**
 * Parses a RESTful instruction. Instruction are composed of the following:
 *
 * [rel-path] [command-couplets]*
 *
 * rel-path: (<relname>[qualifier])*
 * command-couplet: (with|as|emits) <value>
 */
class InstructionParser {

    parse(input) {
        let relPath = input;
        let pathComponents = relPath.split(".").map(parsePathStep);

        return new Instruction(pathComponents);
    }
}

module.exports = InstructionParser;
