/**
 * @file production mode
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const getAssetPath = require('../utils').getAssetPath;
/* eslint-disable fecs-camelcase */

module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const isProd = api.isProd();
        if (!isProd) {
            // dev mode
            webpackConfig.devtool('cheap-module-eval-source-map').output.publicPath(options.baseUrl);

            webpackConfig.plugin('hmr').use(require('webpack/lib/HotModuleReplacementPlugin'));

            // https://github.com/webpack/webpack/issues/6642
            webpackConfig.output.globalObject('this');
            webpackConfig.plugin('no-emit-on-errors').use(require('webpack/lib/NoEmitOnErrorsPlugin'));
            return;
        }

        // prod mode
        const {assetsDir, _args = {}, splitChunks = {}} = options;
        const {modernMode, modernBuild} = _args;

        // 是 modern 模式，但不是 modern 打包，那么 js 加上 legacy
        const isLegacyBundle = modernMode && !modernBuild;
        const filename = getAssetPath(assetsDir, `js/[name]${isLegacyBundle ? '-legacy' : ''}.[chunkhash:8].js`);

        // 条件判断sourcemap是否开启,sentry命令或者hulk.config.js传入
        let ifSourcemap = false;
        if (options._args.sentry || options.sourceMap) {
            ifSourcemap = true;
        }

        webpackConfig
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
                splitChunks
            )
        });

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
                sourceMap: ifSourcemap,
                parallel: true,
                cache: true,
                terserOptions: {
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
                }
            })
        );


        if (options._args.sentry) {
            // --sentry 开启sourcemap
            webpackConfig.plugin('SourceMapDevToolPlugin').use(require('webpack/lib/SourceMapDevToolPlugin'), [{
                    filename: 'sourcemaps/[file].map',
                    append: false
                }

            ]);
        }


        // keep module.id stable when vendor modules does not change
        webpackConfig.plugin('hash-module-ids').use(require('webpack/lib/HashedModuleIdsPlugin'), [
            {
                hashDigest: 'hex'
            }
        ]);
    });
};
