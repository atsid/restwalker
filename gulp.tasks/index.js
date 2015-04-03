"use strict";
let fs = require("fs");
let path = require("path");
let gulp = require("gulp");
require("gulp-semver-tasks")(gulp);

let tasks = fs.readdirSync(path.join(__dirname, "tasks"));
tasks.forEach((task) => require(`./tasks/${task}`).init(gulp));
