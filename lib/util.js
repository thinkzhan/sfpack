const path = require('path');

module.exports = {
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

  extend() {
    function cloneObj(oldObj) {
      if (typeof (oldObj) != 'object') return oldObj;
      if (oldObj == null) return oldObj;
      var newObj = new Object();
      for (var i in oldObj)
        newObj[i] = cloneObj(oldObj[i]);
      return newObj;
    };
    var args = arguments;
    if (args.length < 2) return;
    var temp = cloneObj(args[0]);
    for (var n = 1; n < args.length; n++) {
      for (var i in args[n]) {
        temp[i] = args[n][i];
      }
    }
    return temp;
  }
}
