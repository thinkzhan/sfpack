'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = require('path');
var path__default = _interopDefault(path);
var Watchpack = _interopDefault(require('watchpack'));
var fs$1 = require('fs-extended');
var fs$1__default = _interopDefault(fs$1);
var sfconsole = _interopDefault(require('sfconsole'));
var url = _interopDefault(require('url'));
var htmlparser2 = require('htmlparser2');
var mime = _interopDefault(require('mime'));
var sass = _interopDefault(require('node-sass'));
var babylon = _interopDefault(require('@babel/parser'));
var traverse = _interopDefault(require('@babel/traverse'));
var core = require('@babel/core');
var bs = _interopDefault(require('browser-sync'));
var HashSum = _interopDefault(require('hash-sum'));
var uglifyJs = require('uglify-js');
var CleanCSS = _interopDefault(require('clean-css'));

const global = {
    IDs: {},

    config: {
        compress: false,
        watch: false
    },

    compilation: {
        entry: '',
        page: '',
        dependencies: [],
        htmlName: '',
        cssName: '',
        jsName: '',
        ignoreScripts: []
    },

    getId() {
        const page = global.compilation.page;
        return global.IDs[page]++
    },

    resetId() {
        const page = global.compilation.page;
        global.IDs[page] = 0;
    }
};

function isArray(obj) {
    return Object.prototype.toString.call(obj) == "[object Array]"
}

function isFunction(obj) {
    return Object.prototype.toString.call(obj) == "[object Function]"
}

function isRelative(path) {
    return /^(\.|\.\.\/|\/)/.test(path);
}

function isComponent(tagName, tagAttr) {
    return tagName === 'component' && tagAttr.hasOwnProperty('src');
}
function isHtmlImg(tagName, tagAttr) {
    return tagName === 'img' && isRelative(tagAttr.src);
}

function fileExists(filePath){
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

function findCode(mPath, suffix = 'html') {
    if (suffix === 'js' && !isRelative(mPath)) {        
        return fs.readFileSync(findNodeModule(mPath), 'utf-8');
    } else if (fileExists(mPath) && suffix !== 'scss') {
        return fs.readFileSync(mPath, 'utf-8');
    } else if (fileExists(`${mPath}.${suffix}`)) {
        return fs.readFileSync(`${mPath}.${suffix}`, 'utf-8');
    } else if (fileExists(path.resolve(mPath, `index.${suffix}`))) {
        return fs.readFileSync(path.resolve(mPath, `index.${suffix}`), 'utf-8');
    } 
    return ''
}

function findImg(mPath) {
    if (fileExists(mPath)) {
        return fs.readFileSync(mPath);
    } 
    throw new Error(`[Error] ${mPath} not exist`)
}


function findNodeModule(filename) {
    const packageJsonPath = path.resolve(
        'node_modules',
        filename,
        'package.json'
    );

    if (fs.existsSync(packageJsonPath)) {
        const packj = require(packageJsonPath);
        if (filename === 'babel-polyfill') {
            return path.resolve('node_modules/babel-polyfill/dist/polyfill.js');
        }
        if (packj.main) {
            return path.resolve(
                'node_modules',
                filename,
                /\.js$/.test(packj.main) ? packj.main : `${packj.main}.js`
            );
        }
    }
    return path.resolve(
        'node_modules',
        /\.js$/.test(filename) ? filename : `${filename}.js`
    );
}

var htmlParser = modulePath => {
    const deps = global.compilation.dependencies;
    let code = findCode(modulePath, 'html');
    
    const domHandler = {
        onopentag(tagName, tagAttr) {
            if (isComponent(tagName, tagAttr) && !deps.includes(tagAttr.src)) {
                deps.push(tagAttr.src);
                // not auto load module script
                if (tagAttr.loadscript === 'false') {
                    global.compilation.ignoreScripts.push(tagAttr.src);
                }    
            } else if (isHtmlImg(tagName, tagAttr)) {
                const source = findImg(path.resolve(modulePath, tagAttr.src)); 
                code = code.replace(
                    /(\<img\s*src\=)('|")(.*)(\2.*)/g,
                    ($, $1, $2, $3, $4) => {
                         // limit base64
                        if (global.config.base64 > source.length) {
                            return $1 + $2 + `data:${mime.getType($3) || ''};base64,` + source.toString('base64') + $4
                        } else {
                            const name = path.basename(tagAttr.src);
                            const output = `assets/img/${global.compilation.page}/${name}`;
                            fs$1.createFile(
                                path.resolve(global.config.dist, output),
                                source
                            );
                            return  $1 + $2 + url.resolve(global.config.publicPath, output) + $4
                        }
                    }
                );
            }
        }
    };

    const parser = new htmlparser2.Parser(domHandler, {
        decodeEntities: true,
        recognizeSelfClosing: true
    });
    parser.write(code);
    parser.end();

    return code
};

var styleParser = modulePath => {
    let code = findCode(modulePath, 'scss');
    code = code.replace(
        /(url\(\s*)('|")((?:(?!http\:\/\/|https\:\/\/|\/\/).)+)(\2.*)/g,
        ($, $1, $2, $3, $4) => {
            const source = findImg(path.resolve(modulePath, $3));
            // limit base64
            if (global.config.base64 > source.length) {
                return $1 + $2 + `data:${mime.getType($3) || ''};base64,` + source.toString('base64') + $4
            } else {
                const name = path.basename($3);
                const output = `assets/img/${global.compilation.page}/${name}`;
                fs$1.createFile(
                    path.resolve(global.config.dist, output),
                    source
                );
                return $1 + $2 + url.resolve(global.config.publicPath, output) + $4
            }
        }
    );
    code = sassTransform(code, modulePath);
    return code;
};

function sassTransform(code, modulePath) {
    if (!code) {
        return ''
    }
    return sass.renderSync({
        data: code,
        includePaths: [path.resolve(__dirname, modulePath)]
    }).css.toString();
}

var scriptParser = modulePath => {
    let code = findCode(modulePath, 'js');
 
    if (!isRelative(modulePath)) {
        return code
    }
    code = babelTransform(code, modulePath);
    code =  babelTraverse(code);
    return code
};

function babelTransform(code, modulePath) {
    return core.transform(code, {
        filename: modulePath,
        configFile: path.resolve(__dirname, '../lib/parser/babel.config.js')
    }).code;
}

function babelTraverse(code) {
    const deps = global.compilation.dependencies;
    const ast = babylon.parse(code, {
        sourceType: 'module'
    });

    traverse(ast, {
        ImportDeclaration: ({ node }) => {
            if (!deps.includes(node.source.value)) {
                deps.push(node.source.value);
            }
        },

        CallExpression: node => {
            const args = node.get('arguments');
            const callee = node.get('callee');
            if (callee.isIdentifier()) {
                if (
                    (callee.get('name').node =
                        
                        args.length === 1 &&
                        args[0].type === 'StringLiteral')
                ) {
                    if (!deps.includes(args[0].node.value)) {
                        deps.push(args[0].node.value);
                    }
                }
            }
        }
    });

    return code
}

function getDep(modulePath) {
    const html = htmlParser(modulePath);
    const script = scriptParser(modulePath);
    const style = styleParser(modulePath);
    const dependencies = [ ...global.compilation.dependencies ];
    // recollect
    global.compilation.dependencies = [];

    return {
        id: global.getId(),
        modulePath,
        dependencies, // filename
        mapping: {}, // dependend: id
        ids: [],
        html,
        script,
        style,
        ignoreScripts: global.compilation.ignoreScripts
    };
}

function getDepQueue(entry) {
    const queue = [ getDep(entry) ];

    for (const asset of queue) {
        asset.dependencies.forEach(moduleName => {
            const childModulePath = isRelative(moduleName) ? 
                path__default.resolve(asset.modulePath, moduleName) : moduleName;
            const childModule = getDep(childModulePath);
            asset.mapping[moduleName] = childModule.id;
            asset.ids.push(childModule.id);
            queue.push(childModule);
        });
    }
    return queue;
}

// copy
var Event = (function() {
    var _event,
        _default = "default";
    _event = (function() {
        var _on,
            _emit,
            _remove,
            _create,
            each,
            _shift = Array.prototype.shift,
            _unshift = Array.prototype.unshift,
            namespaceCache = {}; // 命名空间
        /**
         * @desc 内部函数 - 遍历
         * @param {Array} arr
         * @param {Function} fn fn(index, item)
         */
        each = function(arr, fn) {
            var ret;
            for (var index = 0, len = arr.length; index < len; index++) {
                var item = arr[index];
                ret = fn.call(item, index, item); // 将回调函数fn的this指向item
            }
            return ret;
        };

        /**
         * @desc 内部函数 - 注册事件
         * @param {String} key 事件名
         * @param {Function} fn 事件函数
         * @param {Object} cache 某个命名空间下存放多个事件栈的对象
         */
        _on = function(key, fn, cache) {
            if (!cache[key]) {
                cache[key] = [];
            }
            cache[key].push(fn);
        };

        /**
         * @desc 内部函数 - 触发事件
         * @param {Object} cache 某个命名空间下存放多个事件栈的对象
         * @param {String} key 事件名
         * @param {Arguments} ...args 回调函数所需参数
         */
        _emit = function() {
            var cache = _shift.call(arguments),
                key = _shift.call(arguments),
                args = arguments,
                _self = this,
                stack = cache[key];
            if (!stack || !stack.length) {
                // 触发的某个事件的事件栈里若没函数
                return;
            }
            return each(stack, function() {
                // 有则遍历
                // 下面this指向stack中的每一项
                // 然后再指向_emit函数
                return this.apply(_self, args);
            });
        };

        /**
         * @desc 内部函数 - 移除某个或所有注册事件
         * @param {String} key 事件名
         * @param {Function} fn 事件函数
         * @param {Object} cache 某个命名空间下存放多个事件栈的对象
         */
        _remove = function(key, fn, cache) {
            if (cache[key]) {
                // 有注册过才会删除
                if (fn) {
                    // 若传了特定函数，删除特定
                    for (var i = cache[key].length; i >= 0; i--) {
                        // 反向遍历
                        if (cache[key] === fn) {
                            cache[key].splice(i, 1);
                        }
                    }
                } else {
                    // 否则删除所有注册函数
                    cache[key] = [];
                }
            }
        };

        /**
         * @desc 内部函数 - 创建命名空间 核心函数
         * @param {String} namespace 默认值为 _default
         */
        _create = function(namespace) {
            var namespace = namespace || _default,
                cache = {},
                offlineStack = [], // 离线事件 - 主要是为了实现先调用后注册
                ret = {
                    on: function(key, fn, last) {
                        _on(key, fn, cache);
                        if (offlineStack === null) {
                            // 注册过了 则不进行下面的
                            return;
                        }
                        // 没有注册就触发了事件
                        // 在emit函数中将触发事件 离线缓存到了offlineStack
                        if (last === "last") {
                            offlineStack.length && offlineStack.pop()(); // 订阅时只会读取最新一次注册事件 携带的参数
                        } else {
                            // 遍历触发离线缓存的事件栈
                            each(offlineStack, function() {
                                this(); // 下面this指向offlineStack中的每一项
                            });
                        }
                        offlineStack = null; // 置为null 表示已经注册过了
                    },

                    one: function(key, fn, last) {
                        _remove(key, cache);
                        this.on(key, fn, last);
                    },

                    emit: function() {
                        var fn,
                            args,
                            _self = this;
                        _unshift.call(arguments, cache); // 将 某个命名空间下存放多个事件栈的对象cache 放到参数队头
                        args = arguments;
                        // 调用事件
                        fn = function() {
                            return _emit.apply(_self, args);
                        };
                        if (offlineStack) {
                            // offlineStack为[]时，为未注册先调用，将事件fn放进 离线事件栈offlineStack中
                            return offlineStack.push(fn);
                        }
                        return fn(); // 否则触发事件
                    },

                    remove: function(key, fn) {
                        _remove(key, cache, fn);
                    }
                };
            // 缓存命名空间
            return namespace
                ? namespaceCache[namespace]
                    ? namespaceCache[namespace]
                    : (namespaceCache[namespace] = ret)
                : ret;
        };

        /**
         * @desc 对外暴露API
         */
        return {
            create: _create, // 创建命名空间

            // 以下均使用默认的命名空间
            /**
             * @desc 注册事件
             * @param {String} key
             * @param {Function} fn
             * @param {String} last 先调用后注册场景下，注册时只会读取最新一次注册事件 携带的参数
             */
            on: function(key, fn, last) {
                var event = this.create();
                event.on(key, fn, last);
            },

            /**
             * @desc 单例
             * 参数同 on
             */
            one: function(key, fn, last) {
                var event = this.create();
                event.one(key, fn, last);
            },

            /**
             * @desc 触发事件
             * @param {String} key
             * @param {Arguments} args 触发时带的参数
             */
            emit: function() {
                var event = this.create();
                event.emit.apply(this, arguments);
            },

            /**
             * @desc 移除某个事件的某个或所有注册函数
             * @param {String} key 某个事件
             * @param {Function} fn 传则移除某个事件，否则移除所有事件
             */
            remove: function(key, fn) {
                var event = this.create();
                event.remove(key, fn);
            }
        };
    })();
    return _event;
})();

var mergeHtml = graph => {
    function createHtml(id) {
        // ast todo
        return graph[id] ? graph[id].html.replace(
            /\<component\s*src\=('|")([^\'\"]+)\1[^\>]*\/\>/g,
            ($, $1, $2) => {
                return createHtml(graph[id].mapping[$2]);
            }
        ) : '[Error]: invalid component ';
    }
    global.compilation.html = createHtml(0);
    //event: AFTER_MERGE
    Event.emit('AFTER_MERGE_HTML', global);
    // lazy
    return global.compilation.html
};

var mergeScript = (graph) => {
    let modules = '';

    graph.forEach((mod, index) => {
        let modLoad = '';
        index === 0 && mod.dependencies.forEach(d => {          
            if (!mod.ignoreScripts.includes(d)) {
              modLoad += `require('${d}');`;
            }
        });
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

var mergeStyle = graph => {
    let css = [];
    function createCss(ids) {
        ids.forEach(id => {
            if (graph[id]) {
                css.push(graph[id].style);
                css.concat(createCss(graph[id].ids));
            }
        });
        return css;
    }

    global.compilation.style = createCss([0]).join('');

    Event.emit('AFTER_MERGE_STYLE', global);
    return global.compilation.style
};

const console$1 = sfconsole("Pack");

function pack(options) {
    const { entry, dist } = options;

    fs$1__default.deleteSync(dist);
    fs$1__default.ensureDirSync(path__default.resolve(dist, "assets"));
    fs$1__default.ensureDirSync(path__default.resolve(dist, "assets", "img"));

    packSome(entry, options);
}
function packSome(entry, options) {
    entry.forEach(entryItem => {
        packOne(entryItem, options);
    });
    console$1.info("build success!");
}

function packOne(entry, options) {
    const { dist } = options;

    const buildPage = path__default.basename(entry);
    console$1.log(`${buildPage} is buiding...`);
    // set current page in compilation
    global.compilation = {
        entry,
        dependencies: [],
        page: buildPage,
        htmlName: buildPage,
        cssName: buildPage,
        jsName: buildPage,
        ignoreScripts: []
    };
    global.resetId();

    const depQueue = getDepQueue(path__default.resolve(entry));
    const script = mergeScript(depQueue);
    const style = mergeStyle(depQueue);
    const html = mergeHtml(depQueue);
    // console.log(depQueue)
    if (!options.inline || 
        (options.inline && !options.inline.includes(entry))
    ) {
        fs$1__default.createFile(
            path__default.resolve(dist, `assets/${global.compilation.cssName}.css`),
            style
        );
        // generate js
        fs$1__default.createFile(
            path__default.resolve(dist, `assets/${global.compilation.jsName}.js`),
            script
        );
    }
     // generate html
     fs$1__default.createFile(
        path__default.resolve(dist, `${global.compilation.htmlName}.html`),
        html
    );
}

function extend(target, cloneObj) {
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
            target[i] = extend(target[i] || [], copy);
        } else if (type(copy) === "Object") {
            target[i] = extend(target[i] || {}, copy);
        } else {
            target[i] = copy;
        }
    }
    return target;
}

function DevServer(config) {
    this.server = bs.create('pack Server');

    // http://www.browsersync.cn/docs/options/
    const dftConfig = {
        server: {
            baseDir: './dist',
            directory: true
        },
        port: 8080
    };

    this.config = extend(dftConfig, config);
    this.watchDir = this.config.server.baseDir;

    this.server.init(this.config);
}

DevServer.prototype.watch = function() {
    this.server.watch(this.watchDir, (event, file) => {
        this.server.reload();
    });
};

function watcher(options) {
    new DevServer(options.devServer).watch();

    const pageDir = [];

    options.entry.forEach(entryItem => {
        pageDir.push(path__default.resolve(entryItem));
    });

    const wp = new Watchpack({
        aggregateTimeout: 100,
        poll: true,
        ignored: /node_modules|dist/
    });

    wp.watch([], pageDir, Date.now() - 10000);

    wp.on('change', function(filePath, mtime) {
        console.log('change：', filePath);
    });

    wp.on('aggregated', function(changes) {
        console.log('aggregated： ', changes);
        packSome(changes, options);
    });
}

var plugin = plugins => {
    for (let p in plugins) {
        let v = plugins[p];

        if (isFunction(v)) {
            Event.on(p, v);
        } else if (isArray(v)) {
            v.forEach(vv => {
                if (isFunction(vv)) {
                    Event.on(p, vv);
                } else {
                    throw new TypeError('[PLUGIN ERR]: need a Function');
                }
            });
        } else {
            throw new TypeError(
                '[PLUGIN ERR]: need a Function or a Array of Function'
            );
        }
    }
};

var hasPlugin = {
    ['AFTER_MERGE_SCRIPT'](complier) {
        const { compilation, config } = complier;
        if (!config.hash) {
            return
        }
        const hash = HashSum(compilation.script);
        compilation.jsName = compilation.page + '.' + hash;
    },
    ['AFTER_MERGE_STYLE'](complier) {
        const { compilation, config } = complier;
        if (!config.hash) {
            return
        }
        const hash = HashSum(compilation.style);
        compilation.cssName = compilation.page + '.' + hash;
    }
};

var compressPlugin = {
    ['AFTER_MERGE_SCRIPT'](complier) {
        const { compilation, config } = complier;
        if (!config.compress) {
            return
        }
        const min = uglifyJs.minify(compilation.script);
        compilation.script = min.code;
    },
    ['AFTER_MERGE_STYLE'](complier) {
        const { compilation, config } = complier;
        if (!config.compress) {
            return
        }
        const clean = new CleanCSS().minify(compilation.style);
        compilation.style = clean.styles;
    }
};

var htmlResPlugin = {
    ['AFTER_MERGE_HTML'](complier) {
        const { compilation, config } = complier;

        if (config.inline === true || 
            (config.inline && config.inline.includes(compilation.entry))
        ) {
            compilation.html = compilation.html.replace(/\<\/\s*head\s*>/,
                `<style>${compilation.style}</style>
                </head>
                `
            ).replace(/\<\/\s*body\s*>/,
                `<script type="text/javascript">${compilation.script}</script>
                </body>
                `
            );
        } else {
            const outCss = url.resolve(config.publicPath, `./assets/${compilation.cssName}.css`);
            const outJs= url.resolve(config.publicPath, `./assets/${compilation.jsName}.js`);            

            compilation.html = compilation.html.replace(/\<\/\s*head\s*>/,
                `<link href="${outCss}" rel="stylesheet"/>
                </head>
                `
            ).replace(/\<\/\s*body\s*>/,
                `<script src="${outJs}" type="text/javascript"></script>
                </body>
                `
            );
        }
    }
};

plugin(compressPlugin);
plugin(hasPlugin);
plugin(htmlResPlugin);

function index(options) {
    const dftOptions = {
        entryDir: null, // 入口目录 字符串
        entry: null,    // 入口文件 数组
        dist: "./dist",
        publicPath: "/",
        compress: false,
        hash: false,
        devServer: false,
        base64: 2048,
        plugins: {}
    };
    options = extend(dftOptions, options);

    if (options.entryDir) {
        const dir = fs.readdirSync(options.entryDir);
        options.entry = dir.map(page => {
            return options.entryDir + "/" + page;
        });
    }
    
    global.config = options;
    plugin(options.plugins);
    pack(options);
    if (!!options.devServer) {
        watcher(options);
    }
}

module.exports = index;
