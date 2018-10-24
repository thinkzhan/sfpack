var path = require("path");
var fs = require("fs");
var interpret = require("interpret");
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

  var configPath, ext;
  var extensions = Object.keys(interpret.extensions).sort(function (a, b) {
    return a.length - b.length;
  });

  if (argv.config) {
    configPath = path.resolve(argv.config);
    for (var i = extensions.length - 1; i >= 0; i--) {
      var tmpExt = extensions[i];
      if (configPath.indexOf(tmpExt, configPath.length - tmpExt.length) > -1) {
        ext = tmpExt;
        break;
      }
    }
    if (!ext) {
      ext = path.extname(configPath);
    }
  } else {
    for (var i = 0; i < extensions.length; i++) {
      var sfpackConfig = path.resolve("sfpack.config" + extensions[i]);
      if (fs.existsSync(sfpackConfig)) {
        ext = extensions[i];
        configPath = sfpackConfig;
        break;
      }
    }
  }

  if (configPath) {

    function registerCompiler(moduleDescriptor) {
      if (moduleDescriptor) {
        if (typeof moduleDescriptor === "string") {
          require(moduleDescriptor);
        } else if (!Array.isArray(moduleDescriptor)) {
          moduleDescriptor.register(require(moduleDescriptor.module));
        } else {
          for (var i = 0; i < moduleDescriptor.length; i++) {
            try {
              registerCompiler(moduleDescriptor[i]);
              break;
            } catch (e) {
              // do nothing
            }
          }
        }
      }
    }

    registerCompiler(interpret.extensions[ext]);
    options = require(configPath);
  }

  return processConfiguredOptions(options);

  function processConfiguredOptions(options) {
    if (typeof options !== "object" || options === null) {
      console.log("Config did not export an object.");
      process.exit(-1); // eslint-disable-line
    }

    // process Promise
    if (typeof options.then === "function") {
      return options.then(processConfiguredOptions);
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

    if (!options.entry) {
      optimist.showHelp();
      console.error("entry not configured.");
      process.exit(-1); // eslint-disable-line
    }

    if (!Array.isArray(options.entry)) {
      options.entry = [options.entry]
    }

    options.publicPath = options.publicPath || argv['publicPath'] || '';

    options.watch = options.watch || argv['watch'] || false;

    options.dist = options.dist || argv['dist'] || '';
  }
};
