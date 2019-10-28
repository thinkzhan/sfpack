import fs from 'fs';
import { resolve } from 'path';
import babylon from '@babel/parser';
import traverse from '@babel/traverse';
import { transform } from '@babel/core';
import { findCode } from '../help/find'
import { isRelative } from '../help/is'
import global from '../global';

export default modulePath => {
    let code = findCode(modulePath, 'js');
 
    if (!isRelative(modulePath)) {
        return code
    }
    code = babelTransform(code, modulePath);
    code =  babelTraverse(code);
    return code
};

function babelTransform(code, modulePath) {
    return transform(code, {
        filename: modulePath,
        configFile: resolve(__dirname, '../lib/parser/babel.config.js')
    }).code;
}

function babelTraverse(code) {
    const deps = global.compilation.dependencies;
    const ast = babylon.parse(code, {
        sourceType: 'module'
    });

    traverse(ast, {
        ImportDeclaration: ({ node }) => {
            if (!deps.includes(node.source.value)) {
                deps.push(node.source.value);
            }
        },

        CallExpression: node => {
            const args = node.get('arguments');
            const callee = node.get('callee');
            if (callee.isIdentifier()) {
                if (
                    (callee.get('name').node =
                        'require' &&
                        args.length === 1 &&
                        args[0].type === 'StringLiteral')
                ) {
                    if (!deps.includes(args[0].node.value)) {
                        deps.push(args[0].node.value)
                    }
                }
            }
        }
    });

    return code
}