import fs from 'fs-extended';
import path from 'path';
import sfconsole from "sfconsole";
import getDepQueue from './complier';
import mergeHtml from './merge/html';
import mergeScript from './merge/script';
import mergeStyle from './merge/style';
import global from './global';
const console = sfconsole("Pack");

export function pack(options) {
    const { entry, dist } = options;

    fs.deleteSync(dist);
    fs.ensureDirSync(path.resolve(dist, "assets"));
    fs.ensureDirSync(path.resolve(dist, "assets", "img"));

    packSome(entry, options);
}
export function packSome(entry, options) {
    entry.forEach(entryItem => {
        packOne(entryItem, options)
    });
    console.info("build success!");
}

export function packOne(entry, options) {
    const { dist } = options;

    const buildPage = path.basename(entry);
    console.log(`${buildPage} is buiding...`)
    // set current page in compilation
    global.compilation = {
        entry,
        dependencies: [],
        page: buildPage,
        htmlName: buildPage,
        cssName: buildPage,
        jsName: buildPage,
        ignoreScripts: []
    }
    global.resetId();

    const depQueue = getDepQueue(path.resolve(entry));
    const script = mergeScript(depQueue);
    const style = mergeStyle(depQueue);
    const html = mergeHtml(depQueue);
    // console.log(depQueue)
    if (!options.inline || 
        (options.inline && !options.inline.includes(entry))
    ) {
        fs.createFile(
            path.resolve(dist, `assets/${global.compilation.cssName}.css`),
            style
        );
        // generate js
        fs.createFile(
            path.resolve(dist, `assets/${global.compilation.jsName}.js`),
            script
        );
    }
     // generate html
     fs.createFile(
        path.resolve(dist, `${global.compilation.htmlName}.html`),
        html
    );
}
