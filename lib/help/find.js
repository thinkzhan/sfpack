import fs from 'fs';
import { resolve } from 'path';
import { isRelative } from './is';

export function fileExists(filePath){
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

export function findCode(mPath, suffix = 'html') {
    if (suffix === 'js' && !isRelative(mPath)) {        
        return fs.readFileSync(findNodeModule(mPath), 'utf-8');
    } else if (fileExists(mPath) && suffix !== 'scss') {
        return fs.readFileSync(mPath, 'utf-8');
    } else if (fileExists(`${mPath}.${suffix}`)) {
        return fs.readFileSync(`${mPath}.${suffix}`, 'utf-8');
    } else if (fileExists(resolve(mPath, `index.${suffix}`))) {
        return fs.readFileSync(resolve(mPath, `index.${suffix}`), 'utf-8');
    } 
    return ''
}

export function findImg(mPath) {
    if (fileExists(mPath)) {
        return fs.readFileSync(mPath);
    } 
    throw new Error(`[Error] ${mPath} not exist`)
}


export function findNodeModule(filename) {
    const packageJsonPath = resolve(
        'node_modules',
        filename,
        'package.json'
    );

    if (fs.existsSync(packageJsonPath)) {
        const packj = require(packageJsonPath);
        if (filename === 'babel-polyfill') {
            return resolve('node_modules/babel-polyfill/dist/polyfill.js');
        }
        if (packj.main) {
            return resolve(
                'node_modules',
                filename,
                /\.js$/.test(packj.main) ? packj.main : `${packj.main}.js`
            );
        }
    }
    return resolve(
        'node_modules',
        /\.js$/.test(filename) ? filename : `${filename}.js`
    );
}