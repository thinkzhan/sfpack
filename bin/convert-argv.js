var path = require("path");
var fs = require("fs");
var initTemplate = require("./initTemplate");

fs.existsSync = fs.existsSync || path.existsSync;

module.exports = function (optimist, argv, convertOptions) {

  var options = {};

  // Help
  if (argv.help) {
    optimist.showHelp();
    process.exit(-1); // eslint-disable-line
  }
  if (argv.hasOwnProperty('init')) {
    if (argv.init === '') {
      console.log("Input a specfic path or name");
    } else {
      initTemplate(argv.init)
    }
    process.exit(-1); // eslint-disable-line
  }

  if (argv.config) {
    var configPath = path.resolve(argv.config);

    options = require(configPath);
  }

  return processConfiguredOptions(options);

  function processConfiguredOptions(options) {
    if (typeof options !== "object" || options === null) {
      console.log("Config did not export an object.");
      process.exit(-1); // eslint-disable-line
    }

    // process ES6 default
    if (typeof options === "object" && typeof options["default"] === "object") {
      return processConfiguredOptions(options["default"]);
    }

    if (Array.isArray(options)) {
      options.forEach(processOptions);
    } else {
      processOptions(options);
    }

    return options;
  }

  function processOptions(options) {
    options.entry = options.entry || argv['entry'];
    options.entryDir = options.entryDir || argv['entryDir'];

    if (!options.entry && !options.entryDir) {
      optimist.showHelp();
      console.error("entry not configured.");
      process.exit(-1); // eslint-disable-line
    }

    if (!Array.isArray(options.entry)) {
      options.entry = [options.entry]
    }

    options.dist = options.dist || argv['dist'];
    options.publicPath = options.publicPath || argv['publicPath'];
    options.compress = options.compress || argv['compress'];
    options.hash = options.hash || argv['hash'];
    options.devServer = options.devServer || argv['devServer'];
  }
};
