const path = require('path')
const Watchpack = require("watchpack");
const pack = require('../pack');
const DevServer = require('./server');

module.exports = function(options) {
    new DevServer(options.devServer).watch();

    const pageDir = [];

    options.entry.forEach(entryItem => {
      pageDir.push(path.resolve(entryItem))
    })

    const wp = new Watchpack({
      aggregateTimeout: 100,
      poll: true,
      ignored: /node_modules|dist/,
    });

    wp.watch([], pageDir, Date.now() - 10000);

    wp.on("change", function (filePath, mtime) {
      console.log('change：', filePath);
    });

    wp.on("aggregated", function (changes) {
      console.log('aggregated： ', changes);
      pack(options)
    });
}
