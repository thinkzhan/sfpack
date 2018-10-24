const fs = require('fs');
const path = require('path');

const getStyleDependency = require("./getDep/style");
const getScriptDependency = require("./getDep/script");
const getHtmlDependency = require("./getDep/html");

const mergeHtml = require("./merge/html");
const mergeScript = require("./merge/script");
const mergeStyle = require("./merge/style");

const global = require("./global");

function createDependency(filename, options, buildSeq) {
  const dependencies = [];
  const styleCode = getStyleDependency(filename, options).code;
  const scriptCode = getScriptDependency(filename, dependencies, options).code;
  const htmlCode = getHtmlDependency(filename, dependencies, options).code;
  return {
    id: global.IDs[buildSeq]++,
    filename,
    dependencies,
    html: htmlCode,
    script: scriptCode,
    style: styleCode
  };
}

function createGraph(entry, options, buildSeq) {
  const mainAsset = createDependency(entry, options, buildSeq);
  const queue = [mainAsset];

  for (const asset of queue) {
    const needAddDepend = !asset.script;
    asset.mapping = {};
    asset.ids = [];

    asset.dependencies.forEach(relativePath => {
      const absolutePath = path.resolve(asset.filename, relativePath);
      const child = createDependency(absolutePath, options, buildSeq);
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
