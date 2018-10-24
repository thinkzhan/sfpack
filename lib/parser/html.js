const fs = require('fs');
const path = require('path');
const htmlparser = require("htmlparser2");
const { setPublicPath } = require("../help/util");

module.exports = function (filename, dependencies) {
  let code = '';
  if (fs.existsSync(path.resolve(__dirname, filename, 'index.html'))) {
    code = fs.readFileSync(path.resolve(__dirname, filename, 'index.html'), 'utf-8');
    var parser = new htmlparser.Parser({
      onopentag: function (name, attribs) {
        if (isModuleTag(name, attribs)) {
          if (dependencies.indexOf(attribs.src) < 0)
            dependencies.push(attribs.src);
        }
      }
    }, {
      decodeEntities: true
    });

    parser.write(code);
    parser.end();
  }

  return {
    code,
    dependencies
  }
}

function isModuleTag(tagName, attribs) {
  return tagName === "module" && attribs.hasOwnProperty('src')
}
