// 1. name; 2. loader + config; 3. 获取 user config；4. 获取环境变量
/**
 * 修改自：https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/config/css.js
 */
const semver = require('semver');
const npmlog = require('npmlog');

module.exports = {
    id: 'built-in:css',
    apply(api, rootOptions) {
        api.chainWebpack(webpackConfig => {
            const {getAssetPath} = require('../lib/utils');

            const isProd = api.isProd();

            let sassLoaderVersion;
            try {
                sassLoaderVersion = semver.major(require('sass-loader/package.json').version);
            } catch (e) {}
            if (sassLoaderVersion < 8) {
                npmlog.warn(
                    'webpackConfig.css',
                    'A new version of sass-loader is available. Please upgrade for best experience.'
                );
            }

            const defaultSassLoaderOptions = {};
            try {
                defaultSassLoaderOptions.implementation = require('sass');
                // since sass-loader 8, fibers will be automatically detected and used
                if (sassLoaderVersion < 8) {
                    defaultSassLoaderOptions.fiber = require('fibers');
                }
            } catch (e) {}

            // 这里loaderOptions直接用 projectOptions.css 的内容
            const {extract = isProd, sourceMap = rootOptions.sourceMap, loaderOptions = {}, cssPreprocessor} =
                rootOptions.css || {};

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
            const cssPublicPath = '../'.repeat(
                extractOptions.filename.replace(/^\.[\/\\]/, '').split(/[\/\\]/g).length - 1
            );
            // 优先使用 san.config 定义的内容
            const postCSSOptions = loaderOptions.postcss;

            // if building for production but not extracting CSS, we need to minimize
            // the embbeded inline CSS as they will not be going through the optimizing
            // plugin.
            const needInlineMinification = isProd && !shouldExtract;

            const cssnanoOptions = {
                preset: [
                    'default',
                    {
                        mergeLonghand: false,
                        cssDeclarationSorter: false
                    }
                ]
            };
            if (rootOptions.productionSourceMap && sourceMap) {
                cssnanoOptions.map = {inline: false};
            }
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
                    } else {
                        rule.use(styleLoader.name)
                            .loader(styleLoader.loader)
                            .options(styleLoader.options);
                    }

                    const cssLoaderOptions = Object.assign(
                        {
                            sourceMap,
                            importLoaders:
                                // prettier-ignore
                                // stylePostLoader injected by vue-loader
                                1 + (postCSSOptions ? 1 : 0) + (needInlineMinification ? 1 : 0)
                        },
                        loaderOptions.css
                    );

                    if (isCssModule) {
                        cssLoaderOptions.modules = {
                            localIdentName: '[name]_[local]_[hash:base64:5]',
                            ...cssLoaderOptions.modules
                        };
                    } else {
                        delete cssLoaderOptions.modules;
                    }

                    rule.use('css-loader')
                        .loader('css-loader')
                        .options(cssLoaderOptions);

                    if (needInlineMinification) {
                        rule.use('cssnano')
                            .loader('postcss-loader')
                            .options({
                                sourceMap,
                                plugins: [require('cssnano')(cssnanoOptions)]
                            });
                    }

                    if (postCSSOptions) {
                        rule.use('postcss-loader')
                            .loader('postcss-loader')
                            .options(Object.assign({sourceMap}, postCSSOptions));
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
            if (!cssPreprocessor || cssPreprocessor === 'scss' || cssPreprocessor === 'sass') {
                // 添加 sass 逻辑
                createCSSRule(
                    'scss',
                    /\.scss$/,
                    'sass-loader',
                    Object.assign({}, defaultSassLoaderOptions, loaderOptions.scss || loaderOptions.sass)
                );
                if (sassLoaderVersion < 8) {
                    createCSSRule(
                        'sass',
                        /\.sass$/,
                        'sass-loader',
                        Object.assign(
                            {},
                            defaultSassLoaderOptions,
                            {
                                indentedSyntax: true
                            },
                            loaderOptions.sass
                        )
                    );
                } else {
                    createCSSRule(
                        'sass',
                        /\.sass$/,
                        'sass-loader',
                        Object.assign({}, defaultSassLoaderOptions, loaderOptions.sass, {
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
            if (!cssPreprocessor || cssPreprocessor === 'stylus' || cssPreprocessor === 'styl') {
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
                    webpackConfig.plugin('optimize-css').use(require('@intervolga/optimize-cssnano-plugin'), [
                        {
                            sourceMap,
                            cssnanoOptions
                        }
                    ]);
                }
            }
        });
    }
};
