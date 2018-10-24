module.exports = {
  entry: [
    './src/page1',
    './src/page2'
  ],
  dist: './dist',
  publicPath: './',
  watch: true,
  // http://www.browsersync.cn/docs/options/
  devServer: {
    server: {
      baseDir: './dist'
    },
    port: 3001
  }
}
