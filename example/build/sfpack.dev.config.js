module.exports = {
  entry: [
    './src/page1',
    './src/page2'
  ],
  dist: './dist',
  publicPath: './',
  // http://www.browsersync.cn/docs/options/
  devServer: {
    server: {
      baseDir: './dist'
    },
    port: 3001
  }
}
