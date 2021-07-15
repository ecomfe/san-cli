/* eslint-disable */

/**
 * @file san config
 * @author Lohoyo
 *
 * 环境变量, scripts/preview.js脚本中定义
 * COM_PAGE: 组件类型默认情况下, 组件路径是src/components; 值为src/pages中有效目录时, 路径为src/pages/$COM_PAGE/components
 * COM_NAME: 组件名称, 默认avatar
 */
 const path = require('path');

// 静态文件域名
const CDN = 'https://s.bdstatic.com/';

// 生产环境下的静态目录
const STATIC_PRO = 'static/e2e';

const resolve = pathname => path.resolve(__dirname, pathname);

// 这个是 release 目录，打包机器只能支持 output，所以谨慎修改
const outputDir = 'output';
const isProduction = process.env.NODE_ENV === 'production';

console.log('process.env.ONE:', process.env.ONE);

module.exports = {
    assetsDir: isProduction ? STATIC_PRO : 'static',
    publicPath: isProduction ? CDN : '/',
    outputDir,
    // 文件名是否 hash
    filenameHashing:isProduction,
    devServer: {
        port: 8899
    },
    // 这里实际是 webpack copy plugin
    // 多路径可以使用数组
    copy: {
        from: 'template/base.tpl',
        to: 'template'
    },
    // 这是多页面配置
    pages: {
        // 这里是多页打包配置
            demo: {
                entry: './src/pages/demo/index.js',
                template: './template/demo/index.tpl',
                filename: 'template/demo/index.tpl'
            },
            index: {
                entry: './src/pages/index/index.js',
                template: './template/index/index.tpl',
                // 访问路径 localhost:{port}/template/index/index.tpl
                // 这里 {output}/template 目录会被 hulk-mock-server 接管
                // 其他路径不会走 smarty 渲染，所以访问 tpl 文件会出现下载文件
                // 更换router路径，参考 hulk-mock-server 配置
                filename: 'template/index/index.tpl',
                chunks: ['vendors']
            }
    },
    // 默认node_modules的依赖是不过 babel 的
    // 如果依赖是 ESM 版本，要过 babel，请开启这里
    transpileDependencies:['axios'],
    css: {
        sourceMap: isProduction,
        cssPreprocessor: 'less',
        loaderOptions: {
            css: {// modules: {auto: () => true}
            }
        }
    },
    splitChunks: {
        // splitChunks 配置
        // chunks name 如果要在 page 中使用：
        // 如果拆的 chunk 不在 page 中，
        // 那么需要添加 page 的 chunks:[${chunk-name}]
        cacheGroups:{
                vendors: {
                name: 'vendors',
                test: /[\\/]node_modules(?!\/@baidu)[\\/]/,
                // minChunks: 1,
                priority: -10,
                chunks: 'initial'
            }
        }
    },
    plugins: [
        {id:'hulk-mock-server',
        apply(api) {
            // 这里使用接管了{output}/template 路径
            // 详细 hulk mock server 配置说明：https://www.npmjs.com/package/hulk-mock-server
            api.middleware(()=> require('hulk-mock-server')({
                            contentBase: path.join(__dirname, './' + outputDir + '/'),
                            rootDir: path.join(__dirname, './mock'),
                            processors: [`smarty?router=/template/*&baseDir=${path.join(__dirname, `./${outputDir}/template`)}&dataDir=${path.join(__dirname, './mock/_data_')}`] // eslint-disable-line
                        }))
        }}
    ],
    alias:{
        '@assets':resolve('src/assets'),
        '@components':resolve('src/components'),
        '@app': resolve('src/lib/App.js'),
        '@store': resolve('src/lib/Store.js')
    },
    chainWebpack: config => {
        // 这里可以用来扩展 webpack 的配置，使用的是 webpack-chain 语法

        // config.module.rule('img')
        //     .test(/\.(png|jpe?g|gif)(\?.*)?$/)
        //     .use('url-loader').loader(require.resolve('url-loader'))
        //     .options({
        //         limit: 1000,
        //         name: STATIC_PRO + '/img/[name].[contenthash:7].[ext]',
        //         publicPath: isProduction ? CDN : ''
        //     });
    },
    sourceMap: isProduction
};
