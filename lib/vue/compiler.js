"use strict";
const path = require("path");
const fs = require("fs-extended");
const HTMLParser = require("htmlparser2");
const parserJs = require("../parser/script");
const parserCss = require("../parser/style");
const Global = require("../help/global");
const { isRelative } = require("../help/util");

const SFPACKVUE_PREFIX = "SF_VUE__";
const TEMPLATE_ESCAPE_REG = /'/gm;
const TEMPLATE_ESCAPE_REG2 = /\r?\n/gm;
const SCRIPT_REPLACER_REG = /^\s*export\s+default\s*/im;

module.exports = function complier(file, dist, buildPage) {
    if (!file) {
        console.log("file不存在");
    }
    const id = Global.IDs[buildPage];
    const fileName = path.basename(file, ".vue");
    const fileContent = fs.readFileSync(file, "utf-8");
    const contents = parseVueToContents(
        fileContent,
        SFPACKVUE_PREFIX + fileName,
        file
    );

    const graph = createGraph(file, buildPage, contents.js);

    return {
        graph,
        id,
        style: parserCss(fileName, contents.css).code
    };
};

function parseVueToContents(vueContent, fileName, filePath) {
    let scriptContents = "";
    let styleContents = "";
    let templateContents = "";

    const DomUtils = HTMLParser.DomUtils;
    const domEls = HTMLParser.parseDOM(vueContent, { lowerCaseTags: true });

    domEls.forEach(el => {
        switch (el.name) {
            case "script":
                scriptContents = DomUtils.getText(el);
                break;
            case "template":
                templateContents = DomUtils.getInnerHTML(el);
                break;
            case "style":
                styleContents = DomUtils.getText(el).trim();
                break;
        }
    });

    const jsContent = convertToJSContent(
        scriptContents,
        templateContents,
        styleContents,
        fileName,
        filePath
    );

    return {
        js: jsContent,
        css: styleContents
    };
}

function convertToJSContent(script, template, style, fileName, filePath) {
    if (!script) {
        return "";
    }
    filePath = filePath.replace(/\\/g, "/");
    let jsFileContent = `
    if(!window.__VUE_COMPONENTS__) {
        window.__VUE_COMPONENTS__ = {};
    }
`;
    jsFileContent += processJavascript(
        fileName,
        script,
        processTemplate(template),
        style,
        filePath
    );
    jsFileContent += "\n\nwindow." + fileName + " = " + fileName + ";\n\n";
    jsFileContent +=
        "window.__VUE_COMPONENTS__['" +
        fileName.split(SFPACKVUE_PREFIX)[1] +
        "']=" +
        fileName +
        ";\n";

    jsFileContent +=
        "Vue.component('" +
        fileName.replace(new RegExp(SFPACKVUE_PREFIX), "vue-").toLowerCase() +
        "', " +
        fileName +
        ");\n\n";

    return jsFileContent;
}

function processTemplate(template) {
    return (
        "'" +
        template
            .replace(TEMPLATE_ESCAPE_REG, "\\'")
            .replace(TEMPLATE_ESCAPE_REG2, "\\\n") +
        "'"
    );
}

function processJavascript(
    fileName,
    script,
    processedTemplate,
    style,
    filePath
) {
    script = script.replace(
        SCRIPT_REPLACER_REG,
        "var " + fileName + " = Vue.extend("
    );
    script = script.replace(/\;/g, "");
    script += ");\n";
    script += fileName + ".options.template = " + processedTemplate;
    return script;
}

function createDependency(filename, buildSeq, code) {
    const dependencies = [];
    const scriptCode = parserJs(filename, dependencies, code).code;

    return {
        id: Global.IDs[buildSeq]++,
        filename,
        dependencies,
        script: scriptCode
    };
}

function createGraph(entry, buildSeq, code) {
    const mainAsset = createDependency(entry, buildSeq, code);
    const queue = [mainAsset];

    for (const asset of queue) {
        const needAddDepend = !asset.script;
        asset.mapping = {};
        asset.ids = [];

        asset.dependencies.forEach(relativePath => {
            let absolutePath = relativePath;

            if (isRelative(relativePath)) {
                absolutePath = path.join(
                    path.dirname(asset.filename),
                    relativePath
                );

                if (isRelative(absolutePath)) {
                    absolutePath = path.resolve(absolutePath);
                }
            }
            const child = createDependency(absolutePath, buildSeq);
            asset.mapping[relativePath] = child.id;
            asset.ids.push(child.id);

            if (needAddDepend) {
                asset.script += `require('${relativePath}');`;
            }
            queue.push(child);
        });
    }
    return queue;
}
