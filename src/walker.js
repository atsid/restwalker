"use strict";
let debug = require("debug")("restwalker");
let Promise = Promise || require("bluebird");
let isFunction = (x) => typeof x === "function";
let isString = (x) => typeof x === "string";
let isArray = (x) => Array.isArray(x);

/**
 * An integration test helper for "walking" across RESTful rels and performing
 * verification steps when necessary.
 */
class RestWalker {
    constructor(parser, executor) {
        if (!parser) {
            throw new Error("parser must be defined");
        }
        if (!executor) {
            throw new Error("executor must be defined");
        }
        this.parser = parser;
        this.executor = executor;
    }

    setRoot(root) {
        this.executor.setRoot(root);
    }


    /**
     * Invokes a RESTful testing sequence
     * @param sequence An array of commands. A command may be:
     *        * A function to invoke, e.g. for verification of the context; "this" context === bound to the context argument
     *        * A RESTful rel path from the service root. The test runner wil walk the rel-graph and adjusts the context as necessary.
     *        * An array of RESTful rel paths to invoke in parallel.
     * @param context The context object for all of the invocations
     * @returns {Promise} A promise that resolves when the sequence is complete.
     */
    invoke(sequence, context = {}) {
        let promise = Promise.resolve(true);
        sequence.forEach((item) => {
            promise = promise.then(() => this.handleSequenceItem(item, context));
        });
        return promise;
    }

    handleSequenceItem(item, context) {
        if (isFunction(item)) {
            debug(`handling sequence function`);
            return Promise.resolve(item.apply(context));
        } else if (isString(item)) {
            debug(`handling sequence command "${item}"`);
            return this.executeCommand(this.parseInstruction(item), context);
        } else if (isArray(item)) {
            debug(`handling sequence array`);
            return Promise.all(item.map((i) => this.parseInstruction(i)).map((cmd) => this.executeCommand(cmd, context)));
        } else {
            throw new Error(`Could not handle sequence item: ${item}`);
        }
    }

    parseInstruction(instruction) {
        return this.parser.parse(instruction);
    }

    executeCommand(command, context) {
        return this.executor.execute(command, context);
    }
}

module.exports = RestWalker;
