#!/usr/bin/env node

var path = require("path");
// Local version replace global one
// try {
// 	var localsfpack = require.resolve(path.join(process.cwd(), "node_modules", "sfpack", "bin", "build.js"));
// 	if(__filename !== localsfpack) {
// 		return require(localsfpack);
// 	}
// } catch(e) {}

var optimist = require("optimist").usage(
    "sfpack " + require("../package.json").version
);

require("./config-optimist")(optimist);
var argv = optimist.argv;

var options = require("./convert-argv")(optimist, argv);

function processOptions(options) {
    var sfpack = require("../index.js");

    var compiler = sfpack(options);
}

processOptions(options);
