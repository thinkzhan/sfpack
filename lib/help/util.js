const path = require('path');
const HashSum = require('hash-sum');
const Global = require("../help/global");

module.exports = {
  isRelative(path) {
     return (/^(\.|\.\.\/|\/)/.test(path))
  },

  // scripts || styles
  setResHash(type = 'scripts', key, code) {
    Global.Hashs[type][key] = HashSum(code);
  },

  getResHash(type = 'scripts', key) {
    return Global.Hashs[type][key]
  },

  setPublicPath(reg, code, publicPath) {
    if (!publicPath) {
      return code
    }
    return code.replace(reg, ($, $1, $2, $3) => {
      let url = $2;
      if (typeof publicPath === 'function') {
        url = publicPath($2);
      } else if (publicPath.endsWith('/')) {
        url = publicPath + path.join(url);
      } else {
        url = `${publicPath}/${path.join(url)}`;
      }
      return $1 + url + $3;
    })
  },

  extend(target, cloneObj) {
    function type(obj) {
      return Object.prototype.toString.call(obj).slice(8, -1);
    }
    var copy;
    for (var i in cloneObj) {
      copy = cloneObj[i];
      if (target === copy) {
        continue;
      }
      if (type(copy) === "Array") {
        target[i] = arguments.callee(target[i] || [], copy);
      } else if (type(copy) === "Object") {
        target[i] = arguments.callee(target[i] || {}, copy);
      } else {
        target[i] = copy;
      }
    }
    return target;
  }
}
