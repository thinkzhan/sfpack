const Global = require("../help/global");
const Event = require("../help/event");
const { setPublicPath } = require("../help/util");

module.exports = (graph, scriptFilename, styleFilename, inline) => {
    function createHtml(id) {
        return graph[id].html.replace(
            /\<module\s*src\=[\'\"](.*)[\'\"]\s*\/\>/g,
            ($, $1) => {
                return createHtml(graph[id].mapping[$1]);
            }
        );
    }
    Global.compilation.html = createHtml(0);

    if (inline) {
        Global.compilation.html = Global.compilation.html
            .replace(
                /\<\/\s*head\s*>/,
                `
                <style>${styleFilename}</style>
                </head>
            `
            )
            .replace(
                /\<\/\s*body\s*>/,
                `
                <script type="text/javascript">${scriptFilename}</script>
                </body>
            `
            );
    } else {
        Global.compilation.html = Global.compilation.html
            .replace(
                /\<\/\s*head\s*>/,
                `
            <link href="./assets/${styleFilename}" rel="stylesheet">
            </head>
        `
            )
            .replace(
                /\<\/\s*body\s*>/,
                `
            <script src="./assets/${scriptFilename}" type="text/javascript"></script>
            </body>
        `
            );
    }
    //event: AFTER_MERGE
    Event.emit("AFTER_HTML_MERGE", Global);
    // lazy
    return setLinkPublicPath(Global.compilation.html, Global.config.publicPath);
};

function setLinkPublicPath(code, publicPath) {
    const reg = /((?:\<link.*href|\<script.*src|\<img.*src)\s*\=\s*['|"])(.*?)(['|"])/gi;
    return setPublicPath(reg, code, publicPath);
}
