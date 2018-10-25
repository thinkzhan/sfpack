const UglifyJS = require("uglify-js");
const Global = require("../help/global");
const {
    setResHash, getResHash
} = require("../help/util");

module.exports = function mergeScript(graph, buildPage) {
  let modules = '';

  graph.forEach(mod => {
    modules += `${mod.id}: [
        function (require, module, exports) {
          ${mod.script}
        },
        ${JSON.stringify(mod.mapping)},
      ],`;
  });

  modules = modules.substring(0, modules.length - 1);

  let result = `(function(modules) {
        function require(id) {
            if (undefined === id) {
                throw new SyntaxError('require了未知的模块（比如自定义模块需要.js后缀）请检查！')
            }

          var fn = modules[id][0],
              mapping = modules[id][1];
          function localRequire(name) {
            return require(mapping[name]);
          }
          var module = { exports : {} };
          fn(localRequire, module, module.exports);
          return module.exports;
        }
        require(0);
      })({${modules}})
    `;

  if (Global.config.compress) {
    result = UglifyJS.minify(result).code;
  }

  let filename = buildPage + '.js';

  if (Global.config.hash) {
      setResHash('scripts', buildPage, result);
      filename = buildPage + '.' + getResHash('scripts', buildPage) + '.js';
  }

  return {
      code: result,
      name: filename
  };
}
