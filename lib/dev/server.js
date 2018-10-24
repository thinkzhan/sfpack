const bs = require("browser-sync");
const { extend } = require("../help/util");

function DevServer(config) {
  this.server = bs.create('Sfpack Server');

  // http://www.browsersync.cn/docs/options/
  const dftConfig = {
    server: {
      baseDir: './'
    },
    port: 8080
  };

  this.config = extend(dftConfig, config);
  this.watchDir = this.config.server.baseDir

  this.server.init(this.config);
}

DevServer.prototype.watch = function () {
  this.server.watch(this.watchDir, (event, file) => {
    this.server.reload();
    // if (event === "change") {
    //     bs.reload();
    // }
  });
}

module.exports = DevServer
