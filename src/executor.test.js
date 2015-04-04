"use strict";
let chai = require("chai");
let expect = chai.expect;
let Executor = require("./executor");
let Runner = require("./http-runner");
let Parser = require("./parser");
let parser = new Parser();
let request = require("supertest");

let testApp = (conf) => {
    let app = require("express")();
    require("express-jefferson")(app, conf);
    return app;
};

let cmd = (cmd) => parser.parse(cmd);

describe("The HTTP Executor", () => {
    it("throws when constructed without a context", () => {
        expect(() => new Executor()).to.throw();
    });

    it("can be constructed with a URI string", () => {
        expect(new Executor("http://google.com")).to.be.ok;
    });

    it("can handle a simple rel path", () => {
        let app = testApp({
           "routes": {
               "/": {
                   get: [(req, res) => {
                       res.json({
                           title: "testService",
                           links: {
                               "self": {
                                   url: "/",
                                   method: "GET"
                               }
                           }
                       });
                   }]
               }
            }
        });

        let executor = new Executor(new Runner(request(app)));
        return executor.execute(cmd("self"), {});
    });

    it("can populate the context using an 'as' command", () => {
        let app = testApp({
            "routes": {
                "/": {
                    get: [(req, res) => {
                        res.json({
                            title: "testService",
                            links: {
                                "self": {
                                    href: "/",
                                    method: "GET"
                                }
                            }
                        });
                    }]
                }
            }
        });

        let executor = new Executor(new Runner(request(app)));
        let context = {};
        return executor.execute(cmd("self as self"), context).then(() => {
            expect(context.self.title).to.equal("testService");
        });
    });
});
