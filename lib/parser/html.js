const fs = require('fs');
const path = require('path');
const htmlparser = require("htmlparser2");
const {
  setPublicPath
} = require("../help/util");

module.exports = (filename, dependencies) => {
  const isWebComp = /\.html$/.test(filename); // 约定.html依赖为三段式写法
  const p = isWebComp ? path.resolve(filename) : path.resolve(filename, 'index.html');

  let originCode = '';
  let code = '';
  let webCompScript = '',
    webCompStyle = '';

  if (fs.existsSync(p)) {
    originCode = code = fs.readFileSync(p, 'utf-8');

    const webCompStore = {
      templateStart: false,
      scriptStart: false,
      styleStart: false
    }

    const parser = new htmlparser.Parser({
      onopentag(name, attribs) {
        if (isModuleTag(name, attribs)) {
          if (dependencies.indexOf(attribs.src) < 0)
            dependencies.push(attribs.src);
        }

        if (isWebComp) {
          switch (name) {
          case "template":
            webCompStore.templateStart = parser.endIndex + 1;
            break;
          case "script":
            webCompStore.scriptStart = parser.endIndex + 1;
            break;
          case "style":
            webCompStore.styleStart = parser.endIndex + 1;
            break;
          }

        }
      },
      onclosetag(name, attribs) {
        if (isWebComp) {
          switch (name) {
          case "template":
            code = originCode.substring(webCompStore.templateStart, parser.startIndex);
            break;
          case "script":
            webCompScript = originCode.substring(webCompStore.scriptStart, parser.startIndex);
            break;
          case "style":
            webCompStyle = originCode.substring(webCompStore.styleStart, parser.startIndex);
            break;
          }
        }
      }
    }, {
      decodeEntities: true,
      recognizeSelfClosing: true
    });

    parser.write(code);
    parser.end();
  }

  return {
    code,
    dependencies,
    webCompScript,
    webCompStyle
  }
}

function isModuleTag(tagName, attribs) {
  return tagName === "module" && attribs.hasOwnProperty('src')
}
