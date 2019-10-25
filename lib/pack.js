const fs = require("fs-extended");
const path = require("path");
const console = require("sfconsole")("Pack");
const compiler = require("./compiler");
const packVue = require("./vue/pack");
const Global = require("./help/global");

function pack(options) {
    try {
        let { entry, dist } = options;

        fs.deleteSync(dist);
        fs.ensureDirSync(path.resolve(dist, "assets"));
        fs.ensureDirSync(path.resolve(dist, "assets", "img"));

        packSome(entry, options);
        console.info("build success!");
    } catch (e) {
        console.err(e);
    }
}

function packSome(entry, options) {
    let { dist } = options;
    fs.copyDirSync(
        path.resolve(__dirname, "__vue_assets"),
        path.resolve(dist, "assets")
    );

    entry.forEach(entryItem => {
        const buildPage = path.basename(entryItem);

        Global.compilationPage = buildPage;
        Global.IDs[buildPage] = 0;

        // generate img
        fs.listFiles(
            path.resolve(entryItem),
            {
                recursive: true,
                filter(itemPath, stat) {
                    return /\.(png|jpg|jpeg|svg|gif|ttf)/i.test(
                        path.extname(itemPath)
                    );
                }
            },
            (err, files) => {
                files &&
                    files.forEach(f => {
                        const imgP = /^img(s)?|^image(s)?|^pic(s)?/i.test(f)
                            ? f
                            : f.substring(f.indexOf("/"));
                        fs.copySync(
                            path.resolve(entryItem, f),
                            path.join(
                                dist,
                                "/assets/img",
                                buildPage + "_" + path.basename(f)
                            )
                        );
                    });
            }
        );

        // 构建vue页面
        if (/\_vue$/.test(buildPage)) {
            Global.IDs[buildPage] = 1;

            packVue(entryItem, buildPage, dist, Global);
            return;
        }

        const graph = compiler.createGraph(path.resolve(entryItem), buildPage);

        const stylePack = compiler.mergeStyle(graph, buildPage);
        const scriptPack = compiler.mergeScript(graph, buildPage);

        if (
            Global.config.inline === true ||
            (Global.config.inline &&
                Global.config.inline.length &&
                Global.config.inline.indexOf(entryItem) >= 0)
        ) {
            // generate html
            fs.createFile(
                path.resolve(dist, `${buildPage}.html`),
                compiler.mergeHtml(graph, scriptPack.code, stylePack.code, true)
            );
        } else {
            // generate css
            fs.createFile(
                path.resolve(dist, `assets/${stylePack.name}`),
                stylePack.code
            );
            // generate js
            fs.createFile(
                path.resolve(dist, `assets/${scriptPack.name}`),
                scriptPack.code
            );
            // generate html
            fs.createFile(
                path.resolve(dist, `${buildPage}.html`),
                compiler.mergeHtml(graph, scriptPack.name, stylePack.name)
            );
        }
    });
}

module.exports = {
    pack,
    packSome
};
