const Event = require("./event");
const Type = require("./util");

module.exports = (plugins) => {
  for (let p in plugins) {
    let v = plugins[p];

    if (Type.isFunction(v)) {
      Event.on(p, v)
    } else if (Type.isArray(v)) {
      v.forEach(vv => {
        if (Type.isFunction(vv)) {
          Event.on(p, vv)
        } else {
          throw new TypeError('[PLUGIN ERR]: need a Function')
        }
      })
    } else {
      throw new TypeError('[PLUGIN ERR]: need a Function or a Array of Function')
    }
  }
}
