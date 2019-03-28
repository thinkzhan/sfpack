const UglifyJS = require("uglify-js");
const Global = require("../help/global");
const { setResHash, getResHash } = require("../help/util");

module.exports = (graph, buildPage) => {
    let modules = "";

    graph.forEach(mod => {
        modules += `${mod.id}: [
        function (require, module, exports) {
          ${mod.script}
        },
        ${JSON.stringify(mod.mapping)},
      ],`;
    });

    modules = modules.substring(0, modules.length - 1);

    Global.compilation.script = `;(function(modules) {
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

    Event.emit("AFTER_SCRIPT_MERGE", Global);

    if (Global.config.compress) {
        Global.compilation.script = UglifyJS.minify(
            Global.compilation.script
        ).code;
    }

    let filename = buildPage + ".js";

    if (Global.config.hash) {
        setResHash("scripts", buildPage, Global.compilation.script);
        filename = buildPage + "." + getResHash("scripts", buildPage) + ".js";
    }

    return {
        code: Global.compilation.script,
        name: filename
    };
};
