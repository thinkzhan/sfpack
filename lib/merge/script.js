import Event from '../help/event';
import global from '../global';

export default (graph) => {
    let modules = '';

    graph.forEach((mod, index) => {
        let modLoad = ''
        index === 0 && mod.dependencies.forEach(d => {          
            if (!mod.ignoreScripts.includes(d)) {
              modLoad += `require('${d}');`
            }
        })
        modules += `${mod.id}: [
            function (require, module, exports) {
              ${modLoad}
              ${mod.script}
            },
            ${JSON.stringify(mod.mapping)},
      ],`;
    });

    modules = modules.substring(0, modules.length - 1);

    global.compilation.script = `;(function(modules) {
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

    Event.emit('AFTER_MERGE_SCRIPT', global);

    return global.compilation.script
};
