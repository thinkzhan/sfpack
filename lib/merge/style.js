module.exports = function mergeStyle(graph) {
  let css = []

  function createCss(ids) {
    ids.forEach(id => {
      css.push(graph[id].style)
      css.concat(createCss(graph[id].ids))
    })
    return css
  }
  return createCss([0]).join('');
}
