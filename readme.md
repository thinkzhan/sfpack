# sfpack

## 场景

开发一个静态小页面，想用sass、es6，却苦于环境配置

开发一个静态长页面，需要模块化开发，却无从下手

-------

以html为入口的模块化打包工具, 适合轻量级静态页面构建

1. 完全的模块化构建
2. 静态依赖自动解析
3. 默认支持es6、sass
4. 支持多页构建
5. 支持静态压缩、版本hash
6. 浏览器自动刷新
7. 项目模版cli

## 用法

```bash
npm i -g sfpack -g
```

### 开始一个sfpack项目
```bash
sfpack --init=demo

cd demo

npm run dev
```

默认已经支持sass和基础es6语法，如果不满足需求可以自定义`.babelrc`

理论上开箱即可开发

### 打包：配置文件方式
```bash
sfpack  --config=./sfpack.config
```

默认在当前目录寻找`sfpack.config.js`文件

```javascript
module.exports = {
    entry: ['./page1', './page2'],
    dist: './dist',
    publicPath: './',
    compress: false, // default: false 不压缩静态
    hash: false, // default: false 静态不打版本
    devServer: { // http://www.browsersync.cn/docs/options/
        server: {
            baseDir: './dist'
        },
        port: 8080
    }
}
```

### 打包：命令行方式
`sfpack  --entry=./page1 --publicPath=dist`

## 目录要求
参考`example`

```
-page
    -module
        -img
        -index.html
        -index.js
        -index.scss
   -index.html
```

## 模块化

依赖module模块：

```html
<module src="./module"/>
```

效果：
1. 引入 `./module/index.html`
2. `./module/index.js`和 `./module/index.scs`若存在会自动被解析引入

! 自定义js依赖时请显示体现js后缀

如：`require('./other.js')`而非`require('./other')`
