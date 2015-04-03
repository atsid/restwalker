"use strict";
let del = require("del");

module.exports = {
    init (gulp) {
        gulp.task("clean", () => del(["dist"]));
    }
};
