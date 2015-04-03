"use strict";
let istanbul = require("gulp-istanbul");
let isparta = require("isparta");
let paths = require("../paths");
let mocha = require("gulp-mocha");
let config = require("../config");
let gutil = require("gulp-util");

let istanbulInstrumentConf = {
    instrumenter: isparta.Instrumenter,
    includeUntested: true
};

let istanbulReportConf = {
    reporters: ["lcov", "text-summary"]
};

module.exports = {
    init (gulp) {
        let runMocha = () => {
            return gulp.src(paths.test)
                .pipe(mocha({reporter: config.testReporter}));
        };

        gulp.task("test", () => {
            return new Promise((resolve, reject) => {
                gulp.src(paths.source)
                    .pipe(istanbul(istanbulInstrumentConf))
                    .pipe(istanbul.hookRequire())
                    .on("finish", () => {
                        runMocha()
                            .pipe(istanbul.writeReports(istanbulReportConf))
                            .on("end", resolve);
                    })
                    .on("error", (err) => {
                        reject(err);
                    });
            });
        });
        gulp.task("tdd-test", () => {
            runMocha()
                .on("error", (err) => {
                    gutil.log("TDD Error: " + err.message);
                });
        });
    }
};
