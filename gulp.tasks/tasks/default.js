"use strict";
let runSequence = require("run-sequence");

module.exports = {
    init (gulp) {
        gulp.task("copygrammar", () => {
            return gulp.src("src/*.peg")
                .pipe(gulp.dest("dist"));
        });
        gulp.task("build", (cb) => {
            runSequence(
                ["lint", "babel", "copygrammar"],
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
