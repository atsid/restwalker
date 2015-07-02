"use strict";

let promisify = (invocation) => {
    return new Promise((resolve, reject) => {
        invocation.end((err, res) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(res);
            }
        });
    });
};

class HttpRunner {
    constructor (agent) {
        if (!agent) {
            throw new Error("expected agent to be defined");
        }
        this.agent = agent;
        this.root = "";
    }

    setRoot(root) {
        this.root = root;
    }

    invoke(method, path) {
        return promisify(this.invokeRaw(method, path));
    }

    invokeRaw(method, path) {
        if (!method) {
            throw new Error("method must be defined");
        }
        if (!path) {
            throw new Error("path must be defined");
        }
        return this.agent[method](this.root + path);
    }

    get (path) {
        return this.invoke("get", path);
    }

    put (path) {
        return this.invoke("put", path);
    }

    post (path) {
        return this.invoke("post", path);
    }

    delete (path) {
        return this.invoke("delete", path);
    }

    head (path) {
        return this.invoke("head", path);
    }

    options (path) {
        return this.invoke("options", path);
    }
}

module.exports = HttpRunner;
