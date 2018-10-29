const fs = require('fs');
const path = require('path');
const htmlparser = require("htmlparser2");
const {
  setPublicPath
} = require("../help/util");

module.exports = (filename, dependencies) => {
  const p = path.resolve(filename, 'index.html');
  let code = '';
  if (fs.existsSync(p)) {
    code = fs.readFileSync(p, 'utf-8');

    const parser = new htmlparser.Parser({
      onopentag(name, attribs) {
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
