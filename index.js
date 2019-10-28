import fs from "fs";
import watcher from "./lib/dev/watcher";
// import plugin from "./lib/help/plugin";
import global from "./lib/global";
import extend from "./lib/help/extend";
import { pack } from "./lib/pack";
import plugin from "./lib/plugin/register";
import "./lib/plugin/registerInner";

export default function(options) {
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
};
