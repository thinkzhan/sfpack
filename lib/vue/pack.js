const fs = require("fs-extended");
const path = require("path");
const compilerVue = require("./compiler");
const { setPublicPath } = require("../help/util");
const mergeScript = require("../merge/script");
const global = require("../help/global");

module.exports = function(entryItem, buildPage, dist, Global) {
    try {
        Global.compilationPageIsVue = true;
        let allGraph = [];
        let allIds = [];

        fs.listFiles(
            path.resolve(entryItem),
            {
                recursive: true,
                filter(itemPath, stat) {
                    return /\.vue/i.test(path.extname(itemPath));
                }
            },
            (err, files) => {
                const vueComps = {
                    scripts: [],
                    styles: []
                };
                files.forEach(f => {
                    const { graph, id, style } = compilerVue(
                        path.resolve(entryItem, f),
                        dist + "/assets",
                        buildPage
                    );

                    allGraph = allGraph.concat(graph);
                    allIds.push(id);
                    vueComps.styles.push(style);
                });

                allGraph = [
                    {
                        id: 0,
                        filename: "",
                        dependencies: allIds,
                        script: allIds.map(id => `require(${id})`).join(";"),
                        mapping: allIds.reduce((res, id) => {
                            res[id] = id;
                            return res;
                        }, {})
                    }
                ].concat(allGraph);
                vueComps.scripts = mergeScript(allGraph, buildPage).code;

                Global.compilation.html = fs
                    .readFileSync(
                        path.resolve(entryItem, "index.html"),
                        "utf-8"
                    )
                    .replace(
                        /\<\/\s*head\s*>/,

                        global.config.inline === true ||
                        (global.config.inline &&
                            global.config.inline.length &&
                            global.config.inline.indexOf(entryItem) >= 0)
                            ? `    <style>${vueComps.styles}</style>
                            </head>`
                            : `<link rel="stylesheet" type="text/css" href="${buildPage}.css">
                        </head>`
                    )
                    .replace(
                        /\<\/\s*body\s*>/,
                        `
                    <script src="vue.js" type="text/javascript"></script>
                    <script src="${buildPage}.js" type="text/javascript"></script>

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
            }
        );
    } catch (e) {
        console.error(e);
    }
};

function setLinkPublicPath(code, publicPath) {
    const reg = /((?:\<link.*href|\<script.*src|\<img.*src)\s*\=\s*['|"])(.*?)(['|"])/gi;
    return setPublicPath(reg, code, publicPath);
}
