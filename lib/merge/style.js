const CleanCSS = require('clean-css');
const Global = require("../help/global");
const {
    setResHash, getResHash
} = require("../help/util");

module.exports = function mergeStyle(graph, buildPage) {
  let css = []

  function createCss(ids) {
    ids.forEach(id => {
      css.push(graph[id].style)
      css.concat(createCss(graph[id].ids))
    })
    return css
  }

  let result = createCss([0]).join('');

  if (Global.config.compress) {
    result = new CleanCSS().minify(result).styles;
  }

  let filename = buildPage + '.css';

  if (Global.config.hash) {
      setResHash('styles', buildPage, result);
      filename = buildPage + '.' + getResHash('styles', buildPage) + '.css';
  }

  return {
      code: result,
      name: filename
  };
}
