#!/usr/bin/env node

var path = require("path");
// Local version replace global one
// try {
// 	var localsfpack = require.resolve(path.join(process.cwd(), "node_modules", "sfpack", "bin", "build.js"));
// 	if(__filename !== localsfpack) {
// 		return require(localsfpack);
// 	}
// } catch(e) {}

var optimist = require("optimist")
  .usage("sfpack " + require("../package.json").version);

require("./config-optimist")(optimist);

var argv = optimist.argv;

var options = require("./convert-argv")(optimist, argv);


function processOptions(options) {
  // process Promise
  if (typeof options.then === "function") {
    options.then(processOptions).catch(function (err) {
      console.error(err.stack || err);
      process.exit(); // eslint-disable-line
    });
    return;
  }

  var sfpack = require("../index.js");

  var compiler = sfpack(options);

}

processOptions(options);
