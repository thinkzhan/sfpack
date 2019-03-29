const fs = require("fs-extended");
const path = require("path");
const mergeScript = require("../merge/script");
const compilerVue = require("./compiler");
const Global = require("../help/global");

module.exports = function(entry, buildPage, cb) {
    return fs.listFiles(
        entry,
        {
            recursive: true,
            filter(file, stat) {
                return /\.vue/i.test(path.extname(file));
            }
        },
        (err, files) => {
            const vueComps = {
                scripts: [],
                styles: []
            };
            let allGraph = [];
            let allIds = [];
            files.forEach(f => {
                const { graph, id, style } = compilerVue(
                    path.resolve(entry, f),
                    Global.config.dist + "/assets",
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
            cb & cb(allGraph, vueComps);
        }
    );
};

function functionName() {}
