"use strict";
let runSequence = require("run-sequence");
let config = require("../config");

module.exports = {
    init (gulp) {
        gulp.task("ci-config", () => config.testReporter = "spec");

        gulp.task("ci-build", (cb) => {
            runSequence(
                "ci-config",
                "build",
                cb
            );
        });
    }
};
