# sfpack

以html为入口的模块化打包工具, 适合轻量级静态页面构建

1. 完全的模块化构建
2. 静态依赖自动解析
3. 支持es6、sass
4. 支持多页构建
5. 浏览器自动刷新

## 用法

`npm i -g sfpack -g`

### 初始化一个sfpack项目
`sfpack --init=demo`

### 配置文件使用
`sfpack  --config=./sfpack.config`

默认在当前目录寻找`sfpack.config.js`文件

```javascript
module.exports = {
    entry: ['./page1', './page2'],
    dist: './dist',
    publicPath: './',
    compress: false, // default: false 不压缩静态
    watch: true, // default: false 源码修改不自动构建
    devServer: { // http://www.browsersync.cn/docs/options/
        server: {
            baseDir: './dist'
        },
        port: 8080
    }
}
```

### 命令行打包
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
