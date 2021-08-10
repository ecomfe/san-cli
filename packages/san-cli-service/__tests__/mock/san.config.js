/**
 * @file san config file mock
 */

const path = require('path');
const outputDir = 'output';
const resolve = r => path.resolve(r);
module.exports = {
    outputDir,
    // baseUrl: '/',
    // output 路径
    // 这个是 template在 output 的路径
    templateDir: 'the-template-dir',
    // 下面是 loader 配置，可以配置 babel 和 postcss 插件等
    loaderOptions: {},
    // 这是多页面配置
    pages: {
        index: {
            entry: ['./src/pages/index/index.js'],
            template: './pages.template.ejs',
            filename: 'index/index.html'
        }
    },
    // dev-server 配置
    devServer: {
        contentBase: outputDir,
        // 如果是 contentBase = outputDir 谨慎watchContentBase打开，打开后 template 每次文件都会重写，从而导致 hmr 失效，每次都 reload 页面
        port: 9003
    },
    // 生产环境配置，内部配置跟config 一级配置一样，会覆盖默认的一级同名配置
    build: {
        // 推荐使用 s.bdstatic.com CDN域名
        baseUrl: 'https://gss0.bdstatic.com/5bd1bjqh_Q23odCf/',
        assetsDir: 'static/estar',
        templateDir: 'template/webpage/estar'
    },
    chainWebpack: config => {
        // 这里可以用来扩展 webpack 的配置，使用的是 webpack-chain 语法
        config.resolve.alias
            .set('@', resolve('src'));
    },
    // 是否生成 sourcemap，目前不需要
    sourceMap: false
};
