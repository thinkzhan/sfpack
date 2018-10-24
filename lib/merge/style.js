const CleanCSS = require('clean-css');
const Global = require("../help/global");

module.exports = function mergeStyle(graph) {
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

  return result;
}
