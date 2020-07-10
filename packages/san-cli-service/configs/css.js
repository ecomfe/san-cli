/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file css webpack
 * inspired by https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/config/css.js
 */

const semver = require('semver');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const {cssnanoOptions: defaultCssnanoOptions} = require('../options');
const {findExisting} = require('san-cli-utils/path');
const {warn} = require('san-cli-utils/ttyLogger');

module.exports = {
    id: 'built-in:css',
    apply(api, rootOptions) {
        api.chainWebpack(webpackConfig => {
            const {getAssetPath} = require('san-cli-utils/path');

            const isProd = api.isProd();
            const cssOptions = rootOptions.css || {};
            const rootSourceMap = !!rootOptions.sourceMap;
            // 这里loaderOptions直接用 projectOptions.css 的内容
            // prettier-ignore
            const {
                extract = isProd,
                // 不在 css 中单独配置，默认跟 rootOptions.sourceMap 一致
                sourceMap = rootSourceMap,
                loaderOptions = {},
                cssPreprocessor,
                cssnanoOptions
            } = cssOptions;
            const postCSSOptions = loaderOptions.postcss;
            // prettier-ignore
            const hasPostCSSConfig = !!(
                postCSSOptions
                || api.service.pkg.postcss
                || findExisting(
                    ['.postcssrc', '.postcssrc.js', 'postcss.config.js', '.postcssrc.yaml', '.postcssrc.json'],
                    api.resolve('.')
                )
            );

            let {requireModuleExtension} = rootOptions.css || {};
            if (typeof requireModuleExtension === 'undefined') {
                if (loaderOptions.css && loaderOptions.css.modules) {
                    throw new Error(
                        '`css.requireModuleExtension` is required when custom css modules options provided'
                    );
                }
                requireModuleExtension = true;
            }

            const shouldExtract = extract !== false;
            const filename = getAssetPath(
                rootOptions.assetsDir,
                `css/[name]${rootOptions.filenameHashing ? '.[contenthash:8]' : ''}.css`
            );
            const extractOptions = Object.assign(
                {
                    filename,
                    chunkFilename: filename
                },
                extract && typeof extract === 'object' ? extract : {}
            );

            // use relative publicPath in extracted CSS based on extract location
            // use config publicPath first
            const cssPublicPath = rootOptions.publicPath || '../'.repeat(
                extractOptions.filename.replace(/^\.[\/\\]/, '').split(/[\/\\]/g).length - 1
            );
            // 优先使用 san.config 定义的内容

            const styleLoader = require('./loaders/style')(loaderOptions.style, rootOptions, api);

            function createCSSRule(lang, test, loader, options) {
                const baseRule = webpackConfig.module.rule(lang).test(test);

                // rules for *.module.* files
                const extModulesRule = baseRule.oneOf('normal-modules').test(/\.module\.\w+$/);
                applyLoaders(extModulesRule, true);

                // rules for normal CSS imports
                const normalRule = baseRule.oneOf('normal');
                applyLoaders(normalRule, !requireModuleExtension);

                function applyLoaders(rule, isCssModule) {
                    if (shouldExtract) {
                        rule.use('extract-css-loader')
                            .loader(require('mini-css-extract-plugin').loader)
                            .options({
                                hmr: !isProd,
                                publicPath: cssPublicPath
                            });
                    }
                    else {
                        rule.use(styleLoader.name)
                            .loader(styleLoader.loader)
                            .options(styleLoader.options);
                    }

                    const cssLoaderOptions = Object.assign(
                        {
                            sourceMap,
                            importLoaders:
                                // prettier-ignore
                                1 + (hasPostCSSConfig ? 1 : 0)
                        },
                        loaderOptions.css
                    );

                    if (isCssModule) {
                        cssLoaderOptions.modules = {
                            localIdentName: '[name]_[local]_[hash:base64:5]',
                            ...cssLoaderOptions.modules
                        };
                    }
                    else {
                        delete cssLoaderOptions.modules;
                    }

                    rule.use('css-loader')
                        .loader('css-loader')
                        .options(cssLoaderOptions);

                    if (hasPostCSSConfig) {
                        rule.use('postcss-loader')
                            .loader('postcss-loader')
                            .options(
                                Object.assign(
                                    {
                                        sourceMap,
                                        config: {
                                            // 从项目根目录查找 postcss config
                                            path: api.getCwd()
                                        }
                                    },
                                    postCSSOptions
                                )
                            );
                    }

                    if (loader) {
                        rule.use(loader)
                            .loader(loader)
                            .options(Object.assign({sourceMap}, options));
                    }
                }
            }

            createCSSRule('css', /\.css$/);
            createCSSRule('postcss', /\.p(ost)?css$/);
            if (!cssPreprocessor || cssPreprocessor === 'sass') {
                let sassLoaderVersion;
                try {
                    sassLoaderVersion = semver.major(require('sass-loader/package.json').version);
                }
                catch (e) {}
                if (sassLoaderVersion < 8) {
                    warn('A new version of sass-loader is available. Please upgrade for best experience.');
                }
                // 添加 sass 逻辑
                createCSSRule('scss', /\.scss$/, 'sass-loader', Object.assign({}, loaderOptions.sass));
                if (sassLoaderVersion < 8) {
                    createCSSRule(
                        'sass',
                        /\.sass$/,
                        'sass-loader',
                        Object.assign(
                            {},
                            {
                                indentedSyntax: true
                            },
                            loaderOptions.sass
                        )
                    );
                }
                else {
                    createCSSRule(
                        'sass',
                        /\.sass$/,
                        'sass-loader',
                        Object.assign(loaderOptions.sass || {}, {
                            sassOptions: Object.assign({}, loaderOptions.sass && loaderOptions.sass.sassOptions, {
                                indentedSyntax: true
                            })
                        })
                    );
                }
            }
            if (!cssPreprocessor || cssPreprocessor === 'less') {
                createCSSRule(
                    'less',
                    /\.less$/,
                    'less-loader',
                    Object.assign(
                        {
                            javascriptEnabled: true,
                            compress: false
                        },
                        loaderOptions.less
                    )
                );
            }
            if (!cssPreprocessor || cssPreprocessor === 'stylus') {
                createCSSRule(
                    'stylus',
                    /\.styl(us)?$/,
                    'stylus-loader',
                    Object.assign(
                        {
                            preferPathResolver: 'webpack'
                        },
                        loaderOptions.stylus
                    )
                );
            }

            // inject CSS extraction plugin
            if (shouldExtract) {
                webpackConfig.plugin('extract-css').use(require('mini-css-extract-plugin'), [extractOptions]);
                // minify extracted CSS
                if (isProd) {
                    const nanoOptions = {
                        preset: ['default', Object.assign(defaultCssnanoOptions, cssnanoOptions)]
                    };
                    // 压缩
                    webpackConfig.optimization.minimizer('css').use(
                        new OptimizeCSSAssetsPlugin({
                            assetNameRegExp: /\.css$/g,
                            cssProcessorOptions: nanoOptions,
                            canPrint: true
                        })
                    );
                }
            }
        });
    }
};
