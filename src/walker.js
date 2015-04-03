"use strict";
let Promise = Promise || require("bluebird");
//let debug = require("debug")("app:test:rest_walker");
let Command = require("./command");

let isFunction = (x) => typeof x === "function";
let isString = (x) => typeof x === "string";
let isArray = (x) => Array.isArray(x);

/**
 * An integration test helper for "walking" across RESTful rels and performing
 * verification steps when necessary.
 */
class RestWalker {
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
        let promises = sequence.map((i) => () => this.handleSequenceItem(i, context));
        let result = Promise.resolve(true);
        for (let itemPromise in promises) {
            result = result.then(itemPromise);
        }
        return result;
    }

    handleSequenceItem(item, context) {
        if (isFunction(item)) {
            return Promise.cast(item.apply(context));
        } else if (isString(item)) {
            return this.makeRestPathCommand(item).execute(context);
        } else if (isArray(item)) {
            return Promise.all(item.map((i) => this.makeRestPathCommand(i).execute(context)));
        } else {
            throw new Error(`Could not handle sequence item: ${item}`);
        }
    }

    makeRestPathCommand(instruction) {
        let firstSpaceIndex = instruction.indexOf(" ");

        // <rel path> <command> <command> <command>
        // e.g. root.login with credentials as user
        let relPath = instruction, commands = [];
        if (firstSpaceIndex !== -1) {
            relPath = instruction.substring(0, firstSpaceIndex);
            commands = instruction.substring(firstSpaceIndex).trim().split(" ");
        }

        // Parse Commands ("with", "as", "emits")
        let resultAlias = null;
        let payloadProperty = null;
        let expectedResponseCode = null;

        if (commands.length % 2 !== 0) {
            throw new Error(`Unexpected number of commands ${commands.length}`);
        }
        // by 2)
        for (let index in [0..commands.length - 2]) {
            let commandName = commands[index];
            let commandData = commands[index + 1];
            if (commandName === "as") {
                resultAlias = commandData;
            }
            else if (commandName === "with") {
                payloadProperty = commandData;
            }
            else if (commandName === "emits") {
                expectedResponseCode = parseInt(commandData);
            }

            new Command(relPath, resultAlias, payloadProperty, expectedResponseCode);
        }
    }
}

module.exports = RestWalker;
