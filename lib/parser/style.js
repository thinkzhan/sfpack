import { createFile } from 'fs-extended';
import { resolve, basename } from 'path';
import url from 'url';
import mime from 'mime';
import sass from 'node-sass';
import { findCode, findImg } from '../help/find'
import global from '../global';

export default modulePath => {
    let code = findCode(modulePath, 'scss');
    code = code.replace(
        /(url\(\s*)('|")((?:(?!http\:\/\/|https\:\/\/|\/\/).)+)(\2.*)/g,
        ($, $1, $2, $3, $4) => {
            const source = findImg(resolve(modulePath, $3));
            // limit base64
            if (global.config.base64 > source.length) {
                return $1 + $2 + `data:${mime.getType($3) || ''};base64,` + source.toString('base64') + $4
            } else {
                const name = basename($3);
                const output = `assets/img/${global.compilation.page}/${name}`;
                createFile(
                    resolve(global.config.dist, output),
                    source
                );
                return $1 + $2 + url.resolve(global.config.publicPath, output) + $4
            }
        }
    )
    code = sassTransform(code, modulePath);
    return code;
};

function sassTransform(code, modulePath) {
    if (!code) {
        return ''
    }
    return sass.renderSync({
        data: code,
        includePaths: [resolve(__dirname, modulePath)]
    }).css.toString();
}
