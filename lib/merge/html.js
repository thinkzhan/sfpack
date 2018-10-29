const Global = require("../help/global");
const Event = require("../help/event");
const {
  setPublicPath
} = require("../help/util");

module.exports = (graph, scriptFilename, styleFilename) => {
  function createHtml(id) {
    return graph[id].html.replace(/\<module\s*src\=[\'\"](.*)[\'\"]\s*\/\>/g, ($, $1) => {
      return createHtml(graph[id].mapping[$1]);
    })
  }

  Global.compilation.html = createHtml(0).replace(/\<\/\s*head\s*>/, `
        <link href="./style/${styleFilename}" rel="stylesheet">
        </head>
    `).replace(/\<\/\s*body\s*>/, `
        <script src="./script/${scriptFilename}" type="text/javascript"></script>
        </body>
    `);
  //event: AFTER_MERGE
  Event.emit('AFTER_HTML_MERGE', Global)
  // lazy
  return setLinkPublicPath(Global.compilation.html, Global.config.publicPath)
}

function setLinkPublicPath(code, publicPath) {
  const reg = /((?:\<link.*href|\<script.*src|\<img.*src)\s*\=\s*['|"])(.*?)(['|"])/ig;
  return setPublicPath(reg, code, publicPath)
}
