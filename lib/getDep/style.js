const fs = require('fs');
const path = require('path');
const sass = require('node-sass');
const {
  setPublicPath
} = require("../util");
module.exports = function (filename, options) {
  let code = '';

  const styleFilename = path.resolve(__dirname, filename, 'index.scss');
  if (fs.existsSync(styleFilename)) {
    code = fs.readFileSync(styleFilename, 'utf-8');

    code = sass.renderSync({
      data: code,
      includePaths: [path.resolve(__dirname, filename)]
    }).css;

    code = setUrlPublicPath(code.toString(), options.publicPath)
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
