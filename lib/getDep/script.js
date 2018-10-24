const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const {
  transformFromAst
} = require('babel-core');

module.exports = function (filename, dependencies) {
  let code = '';

  const jsFilename = path.resolve(__dirname, filename, /\.js/.test(filename) ? '' : 'index.js');
  if (fs.existsSync(jsFilename)) {
    const jscontent = fs.readFileSync(jsFilename, 'utf-8');

    const ast = babylon.parse(jscontent, {
      sourceType: 'module',
    });

    traverse(ast, {
      ImportDeclaration: ({
        node
      }) => {
        if (dependencies.indexOf(node.source.value) < 0)
          dependencies.push(node.source.value);
      },
    });

    code = transformFromAst(ast, null, {
      presets: ['env'],
    }).code;
  }

  return {
    code,
    dependencies
  }
}
