const pack = require('./lib/pack');
const watcher = require("./lib/dev/watcher");
const global = require("./lib/help/global");

module.exports = function (options) {
  let {
      watch = false
  } = options

  global.config = options;

  pack(options)

  if (watch) {
      watcher(options)
  }
}
