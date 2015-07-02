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
    app.use(require("body-parser")({extended: true}));
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
        return executor.execute(cmd("root.self"), {});
    });

    it("has a setRoot method which can change route paths", () => {
        let app = testApp({
            "routes": {
                "/api": {
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
        executor.setRoot("/api");
        return executor.execute(cmd("root.self"), {});
    });

    it("emits a promise error when the rel does not exist", (done) => {
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
        executor.execute(cmd("root.derp"), {})
        .then(() => {
            throw new Error("Did not expect resolution");
        })
        .catch((err) => {
            expect(err).to.exist;
            done();
        });
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
        return executor.execute(cmd("root.self as self"), context).then(() => {
            expect(context.self.title).to.equal("testService");
        });
    });

    it("can index a collection using the indexer", () => {
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
                                },
                                "data": {
                                    href: "/data",
                                    method: "GET"
                                }
                            }
                        });
                    }]
                },
                "/data": {
                    get: [(req, res) => {
                        res.json({
                            items: [
                                {name: "herp"},
                                {name: "derp"},
                                {name: "flerp"}
                            ]
                        });
                    }]
                }
            }
        });

        let executor = new Executor(new Runner(request(app)));
        let context = {};
        return executor.execute(cmd("root.self.data[1] as data"), context).then(() => {
            expect(context.data.name).to.equal("derp");
        });
    });

    it("can retrieve data with a query arg", () => {
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
                                },
                                "data": {
                                    href: "/data",
                                    method: "GET"
                                }
                            }
                        });
                    }]
                },
                "/data": {
                    get: [(req, res, next) => {
                        if (req.query.a === 1) {
                            next(new Error("expected query arg"));
                        }
                        res.json({
                            items: [
                                {name: "herp"},
                                {name: "derp"},
                                {name: "flerp"}
                            ]
                        });
                    }]
                }
            }
        });

        let executor = new Executor(new Runner(request(app)));
        let context = {};
        return executor.execute(cmd("root.self.data[1]?{a=1} as data"), context).then(() => {
            expect(context.data.name).to.equal("derp");
        });
    });

    it("can POST data using a 'with' command", () => {
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
                                },
                                "create": {
                                    href: "/data",
                                    method: "POST"
                                }
                            }
                        });
                    }]
                },
                "/data": {
                    post: [(req, res) => {
                        expect(req.body.a).to.equal(1);
                        res.json(req.body);
                    }]
                }
            }
        });

        let executor = new Executor(new Runner(request(app)));
        let context = {payload: {a: 1}};
        return executor.execute(cmd("root.self.create with payload as data"), context).then(() => {
            expect(context.data).to.be.ok;
            expect(context.data.a).to.equal(1);
        });
    });

    it("can assert response codes using the 'emits' command", (done) => {
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
                                },
                                "create": {
                                    href: "/data",
                                    method: "POST"
                                }
                            }
                        });
                    }]
                },
                "/data": {
                    post: [(req, res) => {
                        expect(req.body.a).to.equal(1);
                        res.status(400).json(req.body);
                    }]
                }
            }
        });

        let executor = new Executor(new Runner(request(app)));
        let context = {payload: {a: 1}};
        executor.execute(cmd("root.self.create with payload as data emits 200"), context)
            .then(() => {
                throw new Error("Did not expect resolution");
            })
            .catch((err) => {
                expect(err).to.be.ok;
                done();
            });

    });
});
