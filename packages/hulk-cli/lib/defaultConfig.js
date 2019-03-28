/**
 * @file 默认 hulk.config.js配置
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = {
    // css options
    css: {
        // modules = false, extract = isProd, sourceMap = true
    },
    // copy 相关，复制过来过去的，支持 [object({from,to,ignore})]/object({from,to,ignore})
    // copy:{}
    // loaders 配置
    loaderOptions: {
        // babel plugins
        // babel: {
        //     plugins: [require(xxx)]
        // }
        // postcss plugins
        // postcss:{
        //     plugins: [rquire(xxx), options]
        // }
    },
    // 生产环境配置
    production: {
        // 配置 cdn 路径
        // baseUrl: 'https://s.baidu.com/sbc/',
        // 打包 assets 路径
        // assetsDir: 'static',
        // 打包 template 路径
        // templateDir: 'template/webpack/profile',
        // 复制相关
        // copy: {
        //     from: './template',
        //     to: 'template/webpack/profile'
        // }
    }, // build 只会在 build 状态替换到默认的配置
    browserslist: {
        production: ['defaults', 'not ie < 11', 'last 2 versions', '> 1%', 'iOS 7', 'last 3 iOS versions'],
        development: ['defaults', 'not ie < 11', 'last 2 versions', '> 1%', 'iOS 7', 'last 3 iOS versions'],
        modern: []
    },
    // project deployment base
    baseUrl: '/',
    // where to output built files
    outputDir: 'dist',
    templateDir: '',
    // where to put static assets (js/css/img/font/...)
    assetsDir: '',
    // filename for index.html (relative to outputDir)
    indexPath: 'index.html',
    // whether filename will contain hash part
    // multi-page config
    pages: undefined,
    plugins: [],
    // webpack chain, 可以添加 alias
    // chainWebpack: (config)=>{}
    // sev server middlewares ; use return function
    middlewares: [],
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
