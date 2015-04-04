"use strict";
let debug = require("debug")("restwalker");
let Promise = Promise || require("bluebird");

class Executor {
    constructor(runner) {
        if (!runner) {
            throw new Error("Expected runner to be defined.");
        }
        this.runner = runner;
    }

    execute(command, context) {
        // Walk the command path. Link methods must be GET
        let pathLength = command.path.length;
        let lastCommand = command.path[pathLength - 1];

        let chain = this.runner.get("/").then((res) => {
            debug(`retrieved service root`);
            return res.body;
        });
        for (let pathItem of command.path.slice(0, pathLength - 1)) {
            chain = chain.then((result) => this.takeGetStep(result, pathItem));
        }

        return chain
            .then((result) => this.takeStep(result, lastCommand, context, command))
            .catch((err) => {
                debug("Caught Error", err);
            });
    }

    takeGetStep(res, step) {
        debug(`taking step ${step.name}`);
        // TODO: Configure link retrieval.
        // TODO: Link method case insensitivity.
        console.log("Link", res);
        let link = res.links[step.name];
        if (link.method !== "GET") {
            throw new Error("Expected 'GET' link");
        }

        let path = link.href;
        if (step.query) {
            path = path + "?" + step.query;
        }
        return this.runner.get(path).then((result) => {
            let body = result.body;
            if (step.index) {
                // TODO: Configure collection indexing
                return body.items[step.index];
            } else {
                return body;
            }
        });
    }

    takeStep(res, step, context, command) {
        debug(`taking final step '${step.name}'`);
        return new Promise((resolve, reject) => {
            let link = res.links[step.name];
            let method = link.method.toLowerCase();
            let path = link.href;
            if (!method) {
                reject(new Error("Method must exist"));
            }
            if (!path) {
                reject(new Error("Path must exist"));
            }

            if (step.query) {
                path = path + "?" + step.query;
            }

            let invocation = this.runner.invokeRaw(method, path);
            if (command.invocation.with) {
                invocation = invocation.send(context[step.invocation.with]);
            }
            if (command.invocation.emits) {
                invocation = invocation.expect(step.invocation.emits);
            }
            invocation.end((err, res) => {
                if (err) {
                    return reject(err);
                } else {
                    if (command.invocation.as) {
                        context[command.invocation.as] = res.body;
                    }
                    resolve();
                }
            });
        });
    }
}

module.exports = Executor;
