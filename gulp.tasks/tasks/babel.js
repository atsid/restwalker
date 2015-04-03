"use strict";
let paths = require("../paths");
let babel = require("gulp-babel");
let changed = require("gulp-changed");

module.exports = {
    init (gulp) {
        gulp.task("babel", () => {
            return gulp.src(paths.source)
                .pipe(changed(paths.dest))
                .pipe(babel())
                .pipe(gulp.dest(paths.dest));
        });

    }
};
