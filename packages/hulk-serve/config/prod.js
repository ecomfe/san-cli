/**
 * @file prod webpack
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const isProd = options.mode === 'production';

        if (isProd) {
            const getAssetPath = require('../lib/utils').getAssetPath;
            const filename = getAssetPath(options, `js/[name]${options.filenameHashing ? '.[contenthash:8]' : ''}.js`);

            webpackConfig
                .mode('production')
                .devtool(options.productionSourceMap ? 'source-map' : false)
                .output.filename(filename)
                .chunkFilename(filename);

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
                    extractComments: true,
                    sourceMap: false,
                    parallel: true,
                    cache: true,
                    terserOptions: {
                        compress: {
                            unused: true,
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
        }
    });
};
