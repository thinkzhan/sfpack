const fs = require('fs-extended')
const path = require('path')
const console = require('sfconsole')("Pack");
const compiler = require('./compiler');
const global = require("./help/global");

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

      const graph = compiler.createGraph(path.resolve(entryItem), buildPage);

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
      const stylePack = compiler.mergeStyle(graph, buildPage);
      fs.createFileSync(path.resolve(dist, `style/${stylePack.name}`), stylePack.code)
      // generate js
      const scriptPack = compiler.mergeScript(graph, buildPage);
      fs.createFileSync(path.resolve(dist, `script/${scriptPack.name}`), scriptPack.code)
      // generate html
      fs.createFileSync(path.resolve(dist, `${buildPage}.html`), compiler.mergeHtml(graph, scriptPack.name, stylePack.name))
    })
    console.info('build success!')
  } catch (e) {
    console.err(e);
  }
}
