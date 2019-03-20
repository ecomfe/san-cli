/**
 * @file 默认 hulk.config.js配置
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = {
    maxAssetSize: 1 * 1024 * 1024,
    build: {}, // build 只会在 build 状态替换到默认的配置
    // project deployment base
    baseUrl: '/',
    // where to output built files
    outputDir: 'dist',
    // where to put static assets (js/css/img/font/...)
    assetsDir: '',
    // filename for index.html (relative to outputDir)
    indexPath: 'index.html',
    // whether filename will contain hash part
    // multi-page config
    pages: undefined,
    plugins: [],
    devServer: {
        /*
      open: process.platform === 'darwin',
      host: '0.0.0.0',
      port: 8080,
      https: false,
      hotOnly: false,
      proxy: null, // string | Object
      before: app => {}
    */
    }
};
