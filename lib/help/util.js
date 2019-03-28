const path = require("path");
const HashSum = require("hash-sum");
const Global = require("../help/global");

const T = {
    isRelative(path) {
        return /^(\.|\.\.\/|\/)/.test(path);
    },
    // scripts || styles
    setResHash(type = "scripts", key, code) {
        Global.Hashs[type][key] = HashSum(code);
    },

    getResHash(type = "scripts", key) {
        return Global.Hashs[type][key];
    },

    setPublicPath(reg, code, publicPath) {
        if (!publicPath || publicPath === "." || publicPath === "/") {
            publicPath = "./";
        }
        return code.replace(reg, ($, $1, $2, $3) => {
            if (/^(http(s)?\:)?\/\//.test($2)) {
                return $;
            }

            let url = $2,
                assets = "assets/",
                filename = path.basename($2);

            if (/^\<(script|link)/.test($)) {
                assets = "assets/";
            } else if (/^url/.test($)) {
                assets = "assets/img/";
                filename = Global.compilationPage + "_" + filename;
                if (publicPath === "./") {
                    publicPath = "../";
                }
            } else {
                assets = "assets/img/";
                filename = Global.compilationPage + "_" + filename;
            }
            if (publicPath.endsWith("/")) {
                url = `${publicPath}${assets}${filename}`;
            } else {
                url = `${publicPath}/${assets}${filename}`;
            }
            return $1 + url + $3;
        });
    },

    extend(target, cloneObj) {
        function type(obj) {
            return Object.prototype.toString.call(obj).slice(8, -1);
        }
        var copy;
        for (var i in cloneObj) {
            copy = cloneObj[i];
            if (!copy || target === copy) {
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
};
// isString |
(function() {
    var typeArr = [
        "String",
        "Object",
        "Number",
        "Array",
        "Undefined",
        "Function",
        "Null",
        "Symbol"
    ];
    for (var i = 0; i < typeArr.length; i++) {
        (function(name) {
            T["is" + name] = function(obj) {
                return (
                    Object.prototype.toString.call(obj) ==
                    "[object " + name + "]"
                );
            };
        })(typeArr[i]);
    }
})();

module.exports = T;
