const fs = require('fs');
const path = require('path');
const babylon = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const {
  transform
} = require('@babel/core');

const {
  isRelative
} = require('../help/util')

module.exports = (filename, dependencies, source = '') => {
  let code = '';

  // 直接解析，不必分析路径
  if (source !== '') {
    code = babelTransform(source, filename)
    return babelTraverse(code, dependencies);
  }

  let p = path.resolve(filename, /\.js$/.test(filename) ? '' : 'index.js');

  if (!fs.existsSync(p)) {
    p = path.resolve(filename) + '.js';
  }

  if (!isRelative(filename)) {
    p = getPackgePath(filename)
  }

  if (fs.existsSync(p)) {
    code = fs.readFileSync(p, 'utf-8');

    if (code === '') {
      return {
        code,
        dependencies
      }
    }

    if (isRelative(filename)) {
      code = babelTransform(code, filename);
    }

    return babelTraverse(code, dependencies)
  }
  return {
    code,
    dependencies
  }
}

function babelTransform(code, filename) {
  return transform(code, {
    filename,
    configFile: path.resolve(__dirname, 'babel.config.js')
  }).code;
}

function babelTraverse(code, dependencies) {
  const ast = babylon.parse(code, {
    sourceType: 'module',
  });

  traverse(ast, {
    ImportDeclaration: ({
      node
    }) => {
      if (dependencies.indexOf(node.source.value) < 0)
        dependencies.push(node.source.value);
    },

    CallExpression: (node) => {
      const args = node.get('arguments')
      const callee = node.get('callee')
      if (callee.isIdentifier()) {
        if (callee.get('name').node = 'require' &&
          args.length === 1 &&
          args[0].type === 'StringLiteral') {
          if (dependencies.indexOf(args[0].node.value) < 0)
            dependencies.push(args[0].node.value);
        }
      }
    }
  });

  return {
    code,
    dependencies
  }
}

function getPackgePath(filename) {
  var packageJsonPath = path.resolve('node_modules', filename, 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packj = require(packageJsonPath);
    if (filename === 'babel-polyfill') {
      return path.resolve('node_modules/babel-polyfill/dist/polyfill.js')
    }
    if (packj.main) {
      return path.resolve('node_modules', filename, /\.js$/.test(packj.main) ? packj.main : `${packj.main}.js`)
    }
  }
  return path.resolve('node_modules', /\.js$/.test(filename) ? filename : `${filename}.js`)
}
