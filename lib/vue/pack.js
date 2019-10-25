const fs = require("fs-extended");
const path = require("path");
const { setPublicPath } = require("../help/util");
const compilerVue = require("./compilerVue");

module.exports = function(entryItem, buildPage, dist, Global) {
    Global.compilationPageIsVue = true;

    try {
        compilerVue(path.resolve(entryItem), buildPage, function(
            allGraph,
            vueComps
        ) {
            Global.compilation.html = fs
                .readFileSync(path.resolve(entryItem, "index.html"), "utf-8")
                .replace(
                    /\<\/\s*head\s*>/,
                    Global.config.inline === true ||
                    (Global.config.inline &&
                        Global.config.inline.length &&
                        Global.config.inline.indexOf(entryItem) >= 0)
                        ? `    <style>${vueComps.styles}</style>
                            </head>`
                        : `<link rel="stylesheet" type="text/css" href="./${buildPage}.css">
                        </head>`
                )
                .replace(
                    /\<\/\s*body\s*>/,
                    `
                    <script src="./vue.js" type="text/javascript"></script>
                    <script src="./${buildPage}.js" type="text/javascript"></script>
                    <script type="text/javascript">
                        (function(Global, Vue, undefined) {
                            "use strict";

                            new Vue({
                                el: "#app",
                                data: function data() {
                                    return {};
                                },
                                components: {}
                            });
                        })(window, Vue);
                    </script>
                </body>
            `
                );
            fs.createFile(
                path.resolve(dist, `${buildPage}.html`),
                setLinkPublicPath(
                    Global.compilation.html,
                    Global.config.publicPath
                )
            );
            fs.createFile(
                path.resolve(dist, `assets/${buildPage}.js`),
                vueComps.scripts
            );
            fs.createFile(
                path.resolve(dist, `assets/${buildPage}.css`),
                vueComps.styles
            );
        });
    } catch (e) {
        console.error(e);
    }
};

function setLinkPublicPath(code, publicPath) {
    const reg = /((?:\<link.*href|\<script.*src|\<img.*src)\s*\=\s*['|"])(.*?)(['|"])/gi;
    return setPublicPath(reg, code, publicPath);
}
