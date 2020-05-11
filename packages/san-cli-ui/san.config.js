/**
 * @file san config
 * @author
 */
const path = require('path');
const resolve = pathname => path.resolve(__dirname, pathname);

// 静态文件域名
const CDN = '';

// 生产环境下的静态目录
const STATIC_PRO = '';

const isProduction = process.env.NODE_ENV === 'production';
module.exports = {
    assetsDir: isProduction ? STATIC_PRO : 'static',
    publicPath: isProduction ? CDN : '/',
    outputDir: 'dist',
    filenameHashing: isProduction,
    loaderOptions: {
        babel: {
            plugins: [
                [
                    require.resolve('babel-plugin-import'),
                    {
                        libraryName: 'santd',
                        libraryDirectory: 'es',
                        style: true
                    }
                ]
            ]
        }
    },
    css: {
        sourceMap: isProduction,
        cssPreprocessor: 'less'
    },
    pages: {
        index: {
            entry: './client/pages/index.js',
            filename: 'index.html',
            title: 'San ClI UI'
        }
    },
    alias: {
        '@assets': resolve('client/assets'),
        '@components': resolve('client/components'),
        '@lib': resolve('client/lib'),
        '@': resolve('client'),
        '@graphql': resolve('client/graphql')
    },
    chainWebpack: config => {
        // 这里可以用来扩展 webpack 的配置，使用的是 webpack-chain 语法

        config.module.rule('img')
            .test(/\.(png|jpe?g|gif)(\?.*)?$/)
            .use('url-loader').loader(require.resolve('url-loader'))
            .options({
                limit: 1000,
                name: STATIC_PRO + '/img/[name].[hash:7].[ext]',
                publicPath: isProduction ? CDN : ''
            });

        config.module.rule('gql')
            .test(/\.(graphql|gql)$/)
            .use('graphql-loader').loader(require.resolve('graphql-tag/loader'));
    }
};
