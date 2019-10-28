# sfpack

## 场景

开发一个静态小页面，想用 sass、es6，却苦于环境配置

开发一个静态长页面，需要模块化开发，却无从下手

---

以 html 为入口的模块化打包工具, 适合轻量级静态页面构建

1.  完全的模块化构建
2.  静态依赖自动解析
3.  默认支持 es6、sass
4.  支持多页构建
5.  支持静态压缩、版本 hash
6.  浏览器自动刷新
7.  支持资源内联
9.  支持sfc方式
10. 项目模版 cli

甚至支持构建`Vue sfc`项目！

## 用法

```bash
npm i -g sfpack -g
```

### 开始一个 sfpack 项目

```bash
sfpack --init=demo

cd demo

npm run dev
```

默认已经支持 sass 和基础 es6 语法，如果不满足需求可以自定义`.babelrc`

理论上开箱即可开发

### 打包：配置文件方式

```bash
sfpack --config=./pack.config
```

默认在当前目录寻找`pack.config.js`文件

```javascript
module.exports = {
    entry: ["./page1", "./page2"],
    dist: "./dist",
    publicPath: "./",
    compress: false, // default: false 不压缩静态
    hash: false, // default: false 静态不打版本
    inline: false, // inline: true || ["./src/page2"] 静态内联
    devServer: {
        // devServer: true 会采用默认配置 http://www.browsersync.cn/docs/options/
        server: {
            baseDir: "./dist"
        },
        port: 8080
    },

    plugins: []
};
```

提供了简单的基于事件的插件干预资源生成

```javascript
plugins: {
  ['AFTER_MERGE_HTML'](complier) {
    console.log(complier.page + ' is compilation....');
  },
  'AFTER_MERGE_SCRIPT': [complier => {
    complier.compilation.script = 'console.log("replaced...")'
  }, complier => {
    complier.compilation.script += ';console.log("顺序执行...")'
  }],
  ['AFTER_MERGE_STYLE'](complier) {
    complier.compilation.style = `
      * {
          font-size: 20px
      }
    `
  }
}
```

事件列表

-   `AFTER_MERGE_HTML`: html 资源合并后
-   `AFTER_MERGE_SCRIPT`: js 资源合并后
-   `AFTER_MERGE_STYLE`: css 资源合并后

### 打包：命令行方式打包单页面

`sfpack --entry=./page1 --publicPath=dist`

## 模块

参考`example/src/page1`

依赖 component 模块：

```html
<component src="./component"/>
```

    -page
        -component
            -index.html
            -index.js
            -index.scss
       -index.html

效果：
1\. 引入 `./component/index.html`
2\. `./component/index.js`和 `./component/index.scss`若存在会自动被解析引入

### 单文件模块
sfc形式文件引入方式同普通模块，会被自动解析

```html
<template>
      <div class="m-sfc">
        ...
      </div>
</template>

<script>
      console.log('sfc形式...')
</script>

<style>
      .m-sfc {}
</style>
```
