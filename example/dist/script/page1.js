
      (function(modules) {
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
      })({0: [
        function (require, module, exports) {
          require('./module1');require('./module2');
        },
        {"./module1":1,"./module2":2},
      ],1: [
        function (require, module, exports) {
          "use strict";

console.log('module1自动引入');
        },
        {},
      ],2: [
        function (require, module, exports) {
          "use strict";

console.log('module2自动引入');
        },
        {},
      ],})
    