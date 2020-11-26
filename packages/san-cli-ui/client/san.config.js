/**
 * @file san config
 */
const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const resolve = pathname => path.resolve(__dirname, pathname);
const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin');

// 生产环境下的静态目录
const STATIC_PRO = 'static/';

const isProduction = process.env.NODE_ENV === 'production';

process.env.SAN_VAR_APP_GRAPHQL_ENDPOINT = process.env.SAN_VAR_APP_GRAPHQL_ENDPOINT || '';

module.exports = {
    assetsDir: STATIC_PRO,
    publicPath: '/',
    outputDir: 'dist',
    filenameHashing: isProduction,
    css: {
        sourceMap: isProduction,
        cssPreprocessor: 'less',
        extract: true
    },

    pages: {
        index: {
            entry: './pages/index.js',
            filename: 'index.html',
            template: './assets/index.html',
            title: '项目管理器 - san ui',
            chunks: ['index', 'vendors']
        }
    },
    alias: {
        '@': resolve('.'),
        '@lib': resolve('lib'),
        '@assets': resolve('assets'),
        '@locales': resolve('locales'),
        '@graphql': resolve('graphql'),
        '@components': resolve('components')
    },
    chainWebpack: config => {
        config.plugin('clean-webpack-plugin').use(CleanWebpackPlugin);

        // 这里可以用来扩展 webpack 的配置，使用的是 webpack-chain 语法
        config.module.rule('html')
            .use('html-loader')
            .tap(options => {
                options.attrs.push('link:href');
                return options;
            });

        config.module.rule('img')
            .test(/\.(png|jpe?g|gif)(\?.*)?$/)
            .use('url-loader').loader(require.resolve('url-loader'))
            .options({
                limit: 1000,
                name: STATIC_PRO + '/img/[name].[hash:7].[ext]',
                publicPath: '/'
            });

        config.module.rule('gql')
            .test(/\.(graphql|gql)$/)
            .use('graphql-loader').loader(require.resolve('graphql-tag/loader'));

        // 文件夹同名依赖文件自动引入插件
        config.resolve.plugin('directory-named-webpack-plugin')
            .use(DirectoryNamedWebpackPlugin, [{
                honorIndex: true,
                exclude: /node_modules/,
                include: [
                    resolve('components'),
                    resolve('pages')
                ]
            }]);
        config.resolve.alias
            .set('san', isProduction ? 'san/dist/san.spa.min.js' : 'san/dist/san.spa.dev.js');

        config.optimization.splitChunks({
            cacheGroups: {
                // 三方库模块独立打包
                vendors: {
                    name: 'vendors',
                    test: /[\\/]node_modules(?!\/santd)[\\/]/,
                    priority: -10,
                    chunks: 'initial'
                },
                default: false
            }
        });
    },
    devServer: {
        port: 8888
    }
};
