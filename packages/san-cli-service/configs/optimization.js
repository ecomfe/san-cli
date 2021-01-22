/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 优化相关
 * @author ksky521
 */

const TerserPlugin = require('terser-webpack-plugin');
const {getAssetPath} = require('san-cli-utils/path');
const {terserOptions: defaultTerserOptions} = require('../options');

module.exports = {
    id: 'built-in:optimization',
    apply(api, options) {
        api.chainWebpack(webpackConfig => {
            const isProd = api.isProd();
            if (!isProd) {
                return;
            }

            const {assetsDir, splitChunks, terserOptions = {}} = options;
            // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
            const isLegacyBundle = parseInt(process.env.SAN_CLI_LEGACY_BUILD, 10) === 1;
            // sourcemap
            const filename = getAssetPath(
                assetsDir,
                `js/[name]${isLegacyBundle ? '-legacy' : ''}${options.filenameHashing ? '.[contenthash:8]' : ''}.js`
            );
            // 条件判断sourcemap是否开启，san.config.js传入
            let ifSourcemap = false;
            if (options.sourceMap) {
                ifSourcemap = true;
            }
            webpackConfig
                .devtool(
                    ifSourcemap ? (typeof options.sourceMap === 'string' ? options.sourceMap : 'source-map') : false
                )
                .output.filename(filename)
                .chunkFilename(filename);

            // splitChunks
            // // TODO: 这个留吗？留了不通用，偏业务优化
            // // 这里去掉的话，html 那边 chunks 也要修改
            // webpackConfig.optimization.splitChunks(
            //     Object.assign(
            //         {
            //             name: true,
            //             chunks: 'all',
            //             minSize: 30000,
            //             minChunks: 1,
            //             maxAsyncRequests: 5,
            //             maxInitialRequests: 3,
            //             automaticNameDelimiter: '.',
            //             cacheGroups: {
            //                 default: false,
            //                 // 公共css代码抽离
            //                 styles: {
            //                     name: 'css-common',
            //                     test: /\.css$/,
            //                     chunks: 'all',
            //                     enforce: true,
            //                     // 两个以上公用才抽离
            //                     minChunks: 2,
            //                     priority: 20
            //                 },
            //                 // 异步模块命名
            //                 asyncVendors: {
            //                     name(module, chunks) {
            //                         if (Array.isArray(chunks)) {
            //                             const names = chunks
            //                                 .map(({name}) => {
            //                                     return name;
            //                                 })
            //                                 .filter(name => name);
            //                             return names.length ? names.join('-') : 'async';
            //                         }
            //                         return 'async';
            //                     },
            //                     minChunks: 1,
            //                     chunks: 'async',
            //                     priority: 0
            //                 },
            //                 // 三方库模块独立打包
            //                 vendors: {
            //                     name: 'vendors',
            //                     test(mod) {
            //                         return (
            //                             /[\\/]node_modules[\\/]/.test(mod.resource) && mod.type === 'javascript/auto'
            //                         );
            //                     },
            //                     // minChunks: 1,
            //                     priority: -10,
            //                     chunks: 'initial'
            //                 },
            //                 // 公共js代码抽离
            //                 common: {
            //                     name: 'common',
            //                     test: /\.(js|ejs)$/,
            //                     // 只抽取公共依赖模块，保证页面之间公用，并且不经常变化，否则 http cache 不住
            //                     // test(mod) {
            //                     //     return /[\\/]node_modules[\\/]/.test(mod.resource) && mod.type === 'javascript/auto';
            //                     // },
            //                     // 1个以上公用才抽离
            //                     minChunks: 2,
            //                     priority: -20,
            //                     chunks: 'initial',
            //                     reuseExistingChunk: true
            //                 }
            //             }
            //         },
            //         splitChunks
            //     )
            // );
            if (splitChunks) {
                webpackConfig.optimization.splitChunks(splitChunks);
            }

            webpackConfig.optimization.minimizer('js').use(
                new TerserPlugin({
                    extractComments: false,
                    parallel: true,
                    terserOptions: Object.assign(defaultTerserOptions, terserOptions)
                })
            );

            // keep module.id stable when vendor modules does not change
            /**
             * TODO: HashedModuleIdsPlugin → optimization.moduleIds: 'deterministic'
             * TODO: @see https://webpack.js.org/migrate/5
             * TODO: 文档里面这么写，但是没有 webpackConfig.optimization.moduleIds方法，webpackChain的问题？
             * 官方文档又说，optimization.moduleIds也不用设置
             *
             * Consider removing optimization.moduleIds and optimization.chunkIds from your webpack configuration.
             * The defaults could be better,
             * because they support long term caching in production mode and debugging in development mode.
             *
             * webpackConfig.plugin('hash-module-ids').use(require('webpack/lib/HashedModuleIdsPlugin'), [
             *    {
             *        hashDigest: 'hex'
             *    }
             * ]);
             * */
        });
    }
};
