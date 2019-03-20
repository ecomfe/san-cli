/**
 * @file production mode
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const getAssetPath = require('../utils').getAssetPath;

module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const isProd = api.getMode() === 'production';
        if (!isProd) {
            return;
        }
        const {assetsDir, maxAssetSize} = options;

        const filename = getAssetPath(assetsDir, 'js/[name].[contenthash:8].js');

        webpackConfig
            .mode('production')
            .devtool('source-map')
            .output.filename(filename)
            .chunkFilename(filename);

        // splitChunks
        webpackConfig.optimization.splitChunks({
            name: true,
            chunks: 'all',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '.',
            cacheGroups: {
                vendors: {
                    name: 'vendors',
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    chunks: 'initial'
                },
                common: {
                    name: 'common',
                    minChunks: 2,
                    priority: -20,
                    chunks: 'initial',
                    reuseExistingChunk: true
                }
            }
        });
        webpackConfig.performance.maxAssetSize(maxAssetSize);

        // 压缩
        webpackConfig.optimization.minimizer('css').use(
            new OptimizeCSSAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessorOptions: {
                    normalizeUrl: false,
                    discardUnused: false,
                    // 避免 cssnano 重新计算 z-index
                    zindex: false,
                    reduceIdents: false,
                    safe: true,
                    // cssnano 集成了autoprefixer的功能
                    // 会使用到autoprefixer进行无关前缀的清理
                    // 关闭autoprefixer功能
                    // 使用postcss的autoprefixer功能
                    autoprefixer: false,
                    discardComments: {
                        removeAll: true
                    }
                },
                canPrint: true
            })
        );

        webpackConfig.optimization.minimizer('js').use(
            new TerserPlugin({
                extractComments: false,
                sourceMap: false,
                parallel: true,
                cache: true,
                terserOptions: {
                    comments: false,
                    compress: {
                        arrows: false,
                        comparisons: false,
                        switches: false,
                        toplevel: false,
                        typeofs: false,
                        booleans: true, // 0.7kb
                        // prettier-ignore
                        'if_return': true, // 0.4kb
                        // prettier-ignore
                        'collapse_vars': false, // 0.3kb

                        sequences: true, // 0.7kb
                        unused: true,
                        conditionals: true,
                        evaluate: true,
                        // 删掉 debugger
                        drop_debugger: true, // eslint-disable-line
                        // 移除 console
                        drop_console: true, // eslint-disable-line
                        // 移除无用的代码
                        dead_code: true // eslint-disable-line
                    },
                    safari10: false,
                    warnings: false,
                    toplevel: true,
                    ie8: false
                }
            })
        );

        // keep module.id stable when vendor modules does not change
        webpackConfig.plugin('hash-module-ids').use(require('webpack/lib/HashedModuleIdsPlugin'), [
            {
                hashDigest: 'hex'
            }
        ]);
    });
};
