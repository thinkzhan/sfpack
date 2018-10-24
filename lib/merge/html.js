const Global = require("../help/global");
const {
  setPublicPath
} = require("../help/util");

module.exports = function mergeHtml(graph, scriptFilename, styleFilename) {
  function createHtml(id) {
    return graph[id].html.replace(/\<module\s*src\=[\'\"](.*)[\'\"]\s*\/\>/g, ($, $1) => {
      return createHtml(graph[id].mapping[$1]);
    })
  }
  let merged = createHtml(0);
  merged = merged.replace(/\<\/\s*head\s*>/, `
        <link href="./style/${styleFilename}" rel="stylesheet">
        </head>
    `).replace(/\<\/\s*body\s*>/, `
        <script src="./script/${scriptFilename}" type="text/javascript"></script>
        </body>
    `);

  // lazy
  return setLinkPublicPath(merged, Global.config.publicPath)
}

function setLinkPublicPath(code, publicPath) {
  const reg = /((?:\<link.*href|\<script.*src|\<img.*src)\s*\=\s*['|"])(.*?)(['|"])/ig;
  return setPublicPath(reg, code, publicPath)
}
