const fs = require('fs-extended')
const path = require('path')
const console = require('sfconsole')("Pack");
const compiler = require('./compiler');
const global = require("./help/global");

function pack(options) {
  try {
    let {
      entry,
      dist
    } = options

    fs.deleteSync(dist)
    fs.ensureDirSync(path.resolve(dist, 'style'));
    fs.ensureDirSync(path.resolve(dist, 'script'));

    packSome(entry, options)
    console.info('build success!')
  } catch (e) {
    console.err(e);
  }
}

function packSome(entry, options) {
  let {
    dist
  } = options

  entry.forEach(entryItem => {
    const buildPage = path.basename(entryItem);

    global.compilationPage = buildPage;

    global.IDs[buildPage] = 0;
    const graph = compiler.createGraph(path.resolve(entryItem), buildPage);

    // generate img
    fs.listFiles(path.resolve(entryItem), {
      recursive: true,
      filter(itemPath, stat) {
        return /\.(png|jpg|jpeg|svg|gif|ttf)/i.test(path.extname(itemPath));
      }
    }, (err, files) => {
      files.forEach(f => {
        const imgP = /^img(s)?|^image(s)?|^pic(s)?/i.test(f) ? f : f.substring(f.indexOf('/'));
        fs.copySync(path.resolve(entryItem, f), path.join(dist, imgP))
      })
    });

    // generate css
    const stylePack = compiler.mergeStyle(graph, buildPage);
    fs.createFile(path.resolve(dist, `style/${stylePack.name}`), stylePack.code)
    // generate js
    const scriptPack = compiler.mergeScript(graph, buildPage);
    fs.createFile(path.resolve(dist, `script/${scriptPack.name}`), scriptPack.code)
    // generate html
    fs.createFile(path.resolve(dist, `${buildPage}.html`), compiler.mergeHtml(graph, scriptPack.name, stylePack.name))
  })
}

module.exports = {
  pack,
  packSome
}
