module.exports = {
    entry: [
        './page1',
        './page2'
    ],

    dist: './dist',

    publicPath: './',

    watch: false,

    // http://www.browsersync.cn/docs/options/
    devServer: {
        server: {
          baseDir: './dist',
        },
        port: 3001
    }
}
