"use strict";
let request = require("superagent");
let Promise = Promise || require("bluebird");


let doGet = (uri) => {
    return new Promise((resolve, reject) => {
        request.get(uri).end((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res.body);
            }
        });
    });
};

class Executor {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    execute(command, context) {
        doGet(this.apiUrl)
        .then((root) => {

        });
    }
}

module.exports = Executor;
