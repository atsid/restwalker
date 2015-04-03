"use strict";
let chai = require("chai");
let expect = chai.expect;
let InstructionParser = require("./instruction_parser");

describe("The instruction parser", () => {
    it("can be constructed", () => {
        expect(new InstructionParser()).to.be.an.object;
    });

    it("can parse simple rel path components", () => {
        let parser = new InstructionParser();
        let instruction = parser.parse("a.b.c");
        expect(instruction.path[0].rel).to.equal("a");
        expect(instruction.path[1].rel).to.equal("b");
        expect(instruction.path[2].rel).to.equal("c");
    });

    it("can parse rel path components with indices", () => {
        let parser = new InstructionParser();
        let instruction = parser.parse("a[7].b[8].c[9]");
        expect(instruction.path[0].rel).to.equal("a");
        expect(instruction.path[0].collectionIndex).to.equal(7);
        expect(instruction.path[1].rel).to.equal("b");
        expect(instruction.path[1].collectionIndex).to.equal(8);
        expect(instruction.path[2].rel).to.equal("c");
        expect(instruction.path[2].collectionIndex).to.equal(9);
    });
});
