const CleanCSS = require('clean-css');
const Global = require("../help/global");
const {
  setResHash,
  getResHash
} = require("../help/util");

module.exports = (graph, buildPage) => {
  let css = []

  function createCss(ids) {
    ids.forEach(id => {
      css.push(graph[id].style)
      css.concat(createCss(graph[id].ids))
    })
    return css
  }

  Global.compilation.style = createCss([0]).join('');

  Event.emit('AFTER_STYLE_MERGE', Global)

  if (Global.config.compress) {
    Global.compilation.style = new CleanCSS().minify(Global.compilation.style).styles;
  }

  let filename = buildPage + '.css';

  if (Global.config.hash) {
    setResHash('styles', buildPage, Global.compilation.style);
    filename = buildPage + '.' + getResHash('styles', buildPage) + '.css';
  }

  return {
    code: Global.compilation.style,
    name: filename
  };
}
