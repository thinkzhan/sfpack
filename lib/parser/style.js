const fs = require("fs");
const path = require("path");
const sass = require("node-sass");
const Global = require("../help/global");

const { setPublicPath } = require("../help/util");

module.exports = (filename, source = "") => {
    let code = "";
    // 直接解析，不必分析路径
    if (source !== "") {
        return {
            code: setUrlPublicPath(
                sassTransform(source, filename).toString(),
                Global.config.publicPath
            )
        };
    }

    const p = path.resolve(__dirname, filename, "index.scss");

    if (fs.existsSync(p)) {
        code = fs.readFileSync(p, "utf-8");
        if (code) {
            code = sassTransform(code, filename);
            code = setUrlPublicPath(code.toString(), Global.config.publicPath);
        }
    }

    return {
        code
    };
};

function sassTransform(code, filename) {
    return sass.renderSync({
        data: code,
        includePaths: [path.resolve(__dirname, filename)]
    }).css;
}

function setUrlPublicPath(code, publicPath) {
    const reg = /(url\(['"]?)(.*?)(['"]?\))/gi;
    return setPublicPath(reg, code, publicPath);
}
