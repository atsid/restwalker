"use strict";

module.exports = {
    source: ["src/**/*.js", "!src/**/*.test.js"],
    allcode: "src/**/*",
    dest: "./dist",
    main: "src/index.js",
    test: "src/**/*.test.js",
    testhelpers: "test/**/*.js",
    build: {
        main: "Gulpfile.js",
        tasks: "gulp.tasks/**/*"
    }
};
