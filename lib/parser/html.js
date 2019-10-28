import { createFile } from 'fs-extended';
import { resolve, basename, join } from 'path';
import url from 'url';
import { Parser } from 'htmlparser2';
import mime from 'mime';
import { findCode, findImg } from '../help/find'
import { isComponent, isHtmlImg } from '../help/is'
import global from '../global';

export default modulePath => {
    const deps = global.compilation.dependencies;
    let code = findCode(modulePath, 'html');
    
    const domHandler = {
        onopentag(tagName, tagAttr) {
            if (isComponent(tagName, tagAttr) && !deps.includes(tagAttr.src)) {
                deps.push(tagAttr.src);
                // not auto load module script
                if (tagAttr.loadscript === 'false') {
                    global.compilation.ignoreScripts.push(tagAttr.src)
                }    
            } else if (isHtmlImg(tagName, tagAttr)) {
                const source = findImg(resolve(modulePath, tagAttr.src)); 
                code = code.replace(
                    /(\<img\s*src\=)('|")(.*)(\2.*)/g,
                    ($, $1, $2, $3, $4) => {
                         // limit base64
                        if (global.config.base64 > source.length) {
                            return $1 + $2 + `data:${mime.getType($3) || ''};base64,` + source.toString('base64') + $4
                        } else {
                            const name = basename(tagAttr.src);
                            const output = `assets/img/${global.compilation.page}/${name}`;
                            createFile(
                                resolve(global.config.dist, output),
                                source
                            );
                            return  $1 + $2 + url.resolve(global.config.publicPath, output) + $4
                        }
                    }
                )
            }
        }
    }

    const parser = new Parser(domHandler, {
        decodeEntities: true,
        recognizeSelfClosing: true
    });
    parser.write(code);
    parser.end();

    return code
};
