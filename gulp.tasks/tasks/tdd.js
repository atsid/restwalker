"use strict";
let paths = require("../paths");

module.exports = {
    init(gulp) {
        let tddTasks = ["tdd-lint", "tdd-test"];
        gulp.task("tdd", tddTasks, () => gulp.watch(paths.allcode, tddTasks));
    }
};
