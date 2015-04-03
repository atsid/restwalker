"use strict";
let paths = require("../paths");
let eslint = require("gulp-eslint");

let SRC_STATIC_CHECK_GLOB = paths.source.concat([
    paths.main,
    paths.build.main,
    paths.build.tasks
]);
let TEST_STATIC_CHECK_GLOB = [
    paths.test,
    paths.testhelpers
];

let testLintConf = {
    rules: {
        "no-unused-expressions": false
    }
};

module.exports = {
    init (gulp) {
        let lint = (glob, conf={}) => {
            return gulp.src(glob)
                .pipe(eslint(conf))
                .pipe(eslint.format());
        };
        let hardFailing = (task) => task.pipe(eslint.failOnError());

        gulp.task("lint", ["lint-source", "lint-test"]);
        gulp.task("lint-source", () => hardFailing(lint(SRC_STATIC_CHECK_GLOB)));
        gulp.task("lint-test", () => hardFailing(lint(TEST_STATIC_CHECK_GLOB, testLintConf)));
        gulp.task("tdd-lint", ["tdd-lint-source", "tdd-lint-test"]);
        gulp.task("tdd-lint-source", () => lint(SRC_STATIC_CHECK_GLOB));
        gulp.task("tdd-lint-test", () => lint(TEST_STATIC_CHECK_GLOB));
    }
};
