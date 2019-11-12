/**
 * @file 优化相关
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const TerserPlugin = require('terser-webpack-plugin');
const {getAssetPath} = require('san-cli-utils/path');

module.exports = {
    id: 'built-in:optimization',
    apply(api, options) {
        api.chainWebpack(webpackConfig => {
            const isProd = api.isProd();
            if (!isProd) {
                return;
            }

            const {assetsDir, splitChunksCacheGroups = {}, terserOptions = {}} = options;

            // splitChunks
            webpackConfig.optimization.splitChunks({
                name: true,
                chunks: 'all',
                minSize: 30000,
                minChunks: 1,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                automaticNameDelimiter: '.',
                cacheGroups: Object.assign(
                    {
                        default: false,
                        // 公共css代码抽离
                        styles: {
                            name: 'css-common',
                            test: /\.css$/,
                            chunks: 'all',
                            enforce: true,
                            // 两个以上公用才抽离
                            minChunks: 2,
                            priority: 20
                        },
                        // 异步模块命名
                        asyncVendors: {
                            name(module, chunks) {
                                if (Array.isArray(chunks)) {
                                    const names = chunks
                                        .map(({name}) => {
                                            return name;
                                        })
                                        .filter(name => name);
                                    return names.length ? names.join('-') : 'async';
                                }
                                return 'async';
                            },
                            minChunks: 1,
                            chunks: 'async',
                            priority: 0
                        },
                        // 三方库模块独立打包
                        vendors: {
                            name: 'vendors',
                            test(mod) {
                                return /[\\/]node_modules[\\/]/.test(mod.resource) && mod.type === 'javascript/auto';
                            },
                            // minChunks: 1,
                            priority: -10,
                            chunks: 'initial'
                        },
                        // 公共js代码抽离
                        common: {
                            name: 'common',
                            test: /\.(js|ejs)$/,
                            // 只抽取公共依赖模块，保证页面之间公用，并且不经常变化，否则 http cache 不住
                            // test(mod) {
                            //     return /[\\/]node_modules[\\/]/.test(mod.resource) && mod.type === 'javascript/auto';
                            // },
                            // 1个以上公用才抽离
                            minChunks: 2,
                            priority: -20,
                            chunks: 'initial',
                            reuseExistingChunk: true
                        }
                    },
                    options.splitChunks || splitChunksCacheGroups
                )
            });

            // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
            const isLegacyBundle = process.env.SAN_CLI_LEGACY_BUILD;
            // sourcemap
            const filename = getAssetPath(assetsDir, `js/[name]${isLegacyBundle ? '-legacy' : ''}.[chunkhash:8].js`);

            // 条件判断sourcemap是否开启，san.config.js传入
            let ifSourcemap = false;
            if (options.sourceMap) {
                ifSourcemap = true;
            }
            // TODO chunkname 没有 hash
            webpackConfig
                .devtool(ifSourcemap ? 'source-map' : false)
                .output.filename(filename)
                .chunkFilename(filename);

            webpackConfig.optimization.minimizer('js').use(
                new TerserPlugin({
                    extractComments: false,
                    sourceMap: ifSourcemap,
                    parallel: true,
                    cache: true,
                    terserOptions: Object.assign(
                        {
                            comments: false,
                            compress: {
                                unused: true,
                                // 删掉 debugger
                                drop_debugger: true, // eslint-disable-line
                                // 移除 console
                                drop_console: true, // eslint-disable-line
                                // 移除无用的代码
                                dead_code: true // eslint-disable-line
                            },
                            ie8: false,
                            safari10: true,
                            warnings: false,
                            toplevel: true
                        },
                        terserOptions
                    )
                })
            );

            // keep module.id stable when vendor modules does not change
            webpackConfig.plugin('hash-module-ids').use(require('webpack/lib/HashedModuleIdsPlugin'), [
                {
                    hashDigest: 'hex'
                }
            ]);
        });
    }
};
