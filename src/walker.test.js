"use strict";
let chai = require("chai");
let expect = chai.expect;
let Executor = require("./executor");
let Runner = require("./http-runner");
let Parser = require("./parser");
let parser = new Parser();
let request = require("supertest");
let Walker = require("./walker");

let testApp = (conf) => {
    let app = require("express")();
    app.use(require("body-parser")({extended: true}));
    require("express-jefferson")(app, conf);
    return app;
};
let makeWalker = (app) => new Walker(parser, new Executor(new Runner(request(app))));

describe("The script walker", () => {
    it("throws when constructed without correct arguments", () => {
        expect(() => new Walker()).to.throw();
        expect(() => new Walker(parser)).to.throw();
    });

    it("can handle a sequence", () => {
        let didLogin = false;
        let app = testApp({
            "routes": {
                "/": {
                    get: [(req, res) => {
                        res.json({
                            title: "testService",
                            links: {
                                "login": {
                                    href: "/login",
                                    method: "POST"
                                }
                            }
                        });
                    }]
                },
                "/login": {
                    post: [(req, res) => {
                        didLogin = true;
                        res.json({
                            id: "chris",
                            email: "a@b.com",
                            links: {
                                "view-profile": {
                                    href: "/gh",
                                    method: "GET"
                                }
                            }
                        });
                    }]
                },
                "/gh": {
                    get: [(req, res) => {
                        res.json({
                            username: "darthtrevino"
                        });
                    }]
                }
            }
        });

        let walker = makeWalker(app);
        let context = {
            credentials: {
                username: "ctrevino",
                password: "derp"
            }
        };
        let script = [
            "root.login with credentials as user",
            "user.view-profile as profile"
        ];
        return walker.invoke(script, context)
        .then(() => {
            expect(didLogin).to.be.true;
            expect(context.profile.username).to.equal("darthtrevino");
        });

    });
});
