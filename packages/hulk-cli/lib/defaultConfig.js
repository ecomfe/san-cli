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
        production: [
            '> 1.2% in cn',
            'last 2 versions',
            'iOS >=8', // 这里有待商榷
            'android>4.4',
            'not bb>0',
            'not ff>0',
            'not ie>0',
            'not ie_mob>0'
        ],
        development: ['> 1.2% in cn', 'last 2 versions', 'iOS 11']
    },
    // project deployment base
    baseUrl: '/',
    // where to output built files
    outputDir: 'outputDir',
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
        host: '0.0.0.0',
        port: 8899,
        https: false
    }
};
