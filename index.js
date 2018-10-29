const fs = require("fs");
const { pack } = require('./lib/pack');
const watcher = require("./lib/dev/watcher");
const plugin = require("./lib/help/plugin");
const Global = require("./lib/help/global");
const {
  extend
} = require("./lib/help/util");

module.exports = function (options) {
  const dftOptions = {
    entryDir: null,
    entry: null,
    dist: './dist',
    publicPath: '',
    compress: false,
    hash: false,
    devServer: false,
    plugins: {}
  }

  options = extend(dftOptions, options)

  if (options.entryDir) {
    const dir = fs.readdirSync(options.entryDir);
    options.entry = dir.map(page => {
      return options.entryDir + '/' + page
    })
  }

  Global.config = options;

  plugin(options.plugins)

  pack(options)

  if (!!options.devServer) {
    watcher(options)
  }
}
