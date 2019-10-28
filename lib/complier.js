import fs from 'fs';
import path from 'path';
import global from './global';
import htmlParser from './parser/html';
import styleParser from './parser/style';
import scriptParser from './parser/script';
import { isRelative, isComponent } from './help/is'

function getDep(modulePath, isEntry) {
    const { template : html, script : inlineScript, style : inlineStyle} = htmlParser(modulePath, isEntry);
    const script = scriptParser(modulePath, inlineScript);
    const style = styleParser(modulePath, inlineStyle);
    const dependencies = [ ...global.compilation.dependencies ];
    // recollect
    global.compilation.dependencies = [];

    return {
        id: global.getId(),
        modulePath,
        dependencies, // filename
        mapping: {}, // dependend: id
        ids: [],
        html,
        script,
        style,
        ignoreScripts: global.compilation.ignoreScripts
    };
}

export default function getDepQueue(entry) {
    const queue = [ getDep(entry, true) ];

    for (const asset of queue) {
        asset.dependencies.forEach(moduleName => {
            const childModulePath = isRelative(moduleName) ? 
                path.resolve(asset.modulePath, moduleName) : moduleName;
            const childModule = getDep(childModulePath);
            asset.mapping[moduleName] = childModule.id;
            asset.ids.push(childModule.id);
            queue.push(childModule);
        });
    }
    return queue;
}
