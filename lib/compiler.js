const fs = require('fs');
const path = require('path');

const getStyleDependency = require("./parser/style");
const getScriptDependency = require("./parser/script");
const getHtmlDependency = require("./parser/html");

const mergeHtml = require("./merge/html");
const mergeScript = require("./merge/script");
const mergeStyle = require("./merge/style");

const global = require("./help/global");

function createDependency(filename, buildSeq) {
  const dependencies = [];
  const styleCode = getStyleDependency(filename).code;
  const scriptCode = getScriptDependency(filename, dependencies).code;
  const htmlCode = getHtmlDependency(filename, dependencies).code;
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
      const absolutePath = path.resolve(asset.filename, relativePath);
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
