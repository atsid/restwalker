"use strict";
let runSequence = require("run-sequence");

module.exports = {
    init (gulp) {
        gulp.task("build", (cb) => {
            runSequence(
                ["lint", "babel"],
                "test",
                cb
            );
        });

        gulp.task("release", (cb) => {
            runSequence(
                "clean",
                "build",
                cb
            );
        });

        gulp.task("default", ["build"]);
    }
};
