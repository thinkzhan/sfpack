const UglifyJS = require("uglify-js");
const Global = require("../help/global");

module.exports = function mergeScript(graph) {
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

  return result;
}
