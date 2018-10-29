const fs = require('fs');
const path = require('path');

const getStyleDependency = require("./parser/style");
const getScriptDependency = require("./parser/script");
const getHtmlDependency = require("./parser/html");

const mergeHtml = require("./merge/html");
const mergeScript = require("./merge/script");
const mergeStyle = require("./merge/style");

const global = require("./help/global");
const {
  isRelative
} = require("./help/util");

function createDependency(filename, buildSeq) {
  const dependencies = [];
  const htmlDep = getHtmlDependency(filename, dependencies);
  const htmlCode = htmlDep.code;
  const styleCode = getStyleDependency(filename, htmlDep.webCompStyle).code;
  const scriptCode = getScriptDependency(filename, dependencies, htmlDep.webCompScript).code;

  return {
    id: global.IDs[buildSeq]++,
    filename,
    dependencies,
    html: htmlCode,
    script: scriptCode,
    style: styleCode
  };
}

function createGraph(entry, buildSeq) {
  const mainAsset = createDependency(entry, buildSeq);

  const queue = [mainAsset];

  for (const asset of queue) {
    const needAddDepend = !asset.script;
    asset.mapping = {};
    asset.ids = [];

    asset.dependencies.forEach(relativePath => {
      let absolutePath = relativePath;
      if (isRelative(relativePath)) {
        if (!asset.html) {
          absolutePath = path.join(path.dirname(asset.filename), relativePath)
          if (isRelative(absolutePath)) {
            absolutePath = path.resolve(absolutePath)
          }
        } else {
          absolutePath = path.resolve(asset.filename, relativePath)
        }
      }

      const child = createDependency(absolutePath, buildSeq);
      asset.mapping[relativePath] = child.id;
      asset.ids.push(child.id);

      if (needAddDepend) {
        asset.script += `require('${relativePath}');`
      }
      queue.push(child);
    });
  }
  return queue;
}

module.exports = {
  createGraph,
  mergeHtml,
  mergeStyle,
  mergeScript
}
