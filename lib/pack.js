const global = require("./global");
const fs = require('fs-extended')
const path = require('path')
const console = require('sfconsole')("Pack");
const compiler = require('./compiler');

module.exports = function packAll(options) {
  try {
    const {
      entry,
      dist = './dist',
      publicPath = ''
    } = options

    fs.deleteSync(dist)
    fs.ensureDirSync(path.resolve(dist, 'style'));
    fs.ensureDirSync(path.resolve(dist, 'script'));

    entry.forEach(entryItem => {
      const buildPage = path.basename(entryItem);

      global.IDs[buildPage] = 0;

      const graph = compiler.createGraph(path.resolve(entryItem), options, buildPage);

      // generate img
      fs.listAllSync(path.resolve(entryItem), {
        recursive: true,
        filter: function (itemPath, stat) {
          return stat.isFile() && /\.(png|jpg|jpeg|svg|gif|ttf)/i.test(path.extname(itemPath));
        }
      }).forEach(f => {
        fs.copySync(path.resolve(entryItem, f), path.join(dist, f.substring(f.indexOf('/'))))
      });

      // generate css
      fs.createFileSync(path.resolve(dist, `style/${buildPage}.css`), compiler.mergeStyle(graph))
      // generate js
      fs.createFileSync(path.resolve(dist, `script/${buildPage}.js`), compiler.mergeScript(graph))
      // generate html
      fs.createFileSync(path.resolve(dist, `${buildPage}.html`), compiler.mergeHtml(graph, buildPage, options))
    })
    console.info('build success!')
  } catch (e) {
    console.err(e);
  }
}
