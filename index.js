const pack = require('./lib/pack');
const watcher = require("./lib/watcher");

module.exports = function (options) {
  let {
      watch = false
  } = options

  pack(options)

  if (watch) {
      watcher(options)
  }
}
