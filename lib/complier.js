import fs from 'fs';
import path from 'path';
import global from './global';
import htmlParser from './parser/html';
import styleParser from './parser/style';
import scriptParser from './parser/script';
import { isRelative } from './help/is'

function getDep(modulePath) {
    const html = htmlParser(modulePath);
    const script = scriptParser(modulePath);
    const style = styleParser(modulePath);
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
    const queue = [ getDep(entry) ];

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
