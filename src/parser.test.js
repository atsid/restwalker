"use strict";
let chai = require("chai");
let expect = chai.expect;
let Parser = require("./parser");
let parser = new Parser();

let parse = (input) => {
    let result = parser.parse(input);
    return result;
};

describe("The Grammar Parser", () => {
    it("can be constructed", () => {
        expect(parser).to.be.ok;
    });

    it("can parse a rel", () => {
        let result = parse("edit");
        expect(result.path[0].name).to.equal("edit");
    });

    it("can parse a rel with an index", () => {
        let result = parse("edit[1]");
        expect(result.path[0].name).to.equal("edit");
        expect(result.path[0].index).to.equal(1);
    });

    it("can parse a rel with a query arg", () => {
        let result = parse("derp?{some_query_arg}");
        expect(result.path[0].name).to.equal("derp");
        expect(result.path[0].query).to.equal("some_query_arg");
    });

    it("can parse mixed index and query arguments", () => {
        let assert = (input) => {
            let result = parse(input);
            expect(result.path[0].name).to.equal("derp");
            expect(result.path[0].query).to.equal("some_query_arg");
            expect(result.path[0].index).to.equal(5);
            expect(result.path[0].forceReload).to.equal(true);
        };
        assert("derp!?{some_query_arg}[5]");
        assert("derp![5]?{some_query_arg}");
    });

    it("can parse a simple rel path", () => {
        let result = parse("self.edit.delete");
        expect(result.path.length).to.equal(3);
        expect(result.path[0].name).to.equal("self");
        expect(result.path[1].name).to.equal("edit");
        expect(result.path[2].name).to.equal("delete");
    });


    it("can parse a rel path", () => {
        let result = parse("create[0].edit?{derp}");
        expect(result.path.length).to.equal(2);
        expect(result.path[0].name).to.equal("create");
        expect(result.path[0].index).to.equal(0);
        expect(result.path[1].name).to.equal("edit");
        expect(result.path[1].query).to.equal("derp");
    });

    it("can parse 'with' commands", () => {
        let result = parse("edit with payload");
        expect(result.invocation.with).to.equal("payload");
    });

    it("can parse 'as' commands", () => {
        let result = parse("edit with payload as result");
        expect(result.invocation.with).to.equal("payload");
        expect(result.invocation.as).to.equal("result");
    });

    it("can parse 'emits' commands", () => {
        let result = parse("create.self.edit with payload as result emits 200");
        expect(result.invocation.with).to.equal("payload");
        expect(result.invocation.as).to.equal("result");
        expect(result.invocation.emits).to.equal(200);
    });
});
