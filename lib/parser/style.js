const fs = require('fs');
const path = require('path');
const sass = require('node-sass');
const Global = require("../help/global");

const {
  setPublicPath
} = require("../help/util");

module.exports = function (filename) {
  let code = '';

  const styleFilename = path.resolve(__dirname, filename, 'index.scss');
  if (fs.existsSync(styleFilename)) {
    code = fs.readFileSync(styleFilename, 'utf-8');

    code = sass.renderSync({
      data: code,
      includePaths: [path.resolve(__dirname, filename)]
    }).css;

    code = setUrlPublicPath(code.toString(), Global.config.publicPath)
  }

  return {
    code
  }
}

function setUrlPublicPath(code, publicPath) {
  const reg = /(url\(['"]?)(.*?)(['"]?\))/ig;
  if (!publicPath || publicPath === '.' || publicPath === './' || publicPath === '/') {
    publicPath = '../'
  }
  return setPublicPath(reg, code, publicPath)
}
