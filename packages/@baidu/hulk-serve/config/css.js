/**
 * @file css webpack
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const {findExisting} = require('@baidu/hulk-utils');
const getAssetPath = require('../lib/utils').getAssetPath;
module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const isProd = process.env.NODE_ENV === 'production';

        const {modules = false, extract = isProd, sourceMap = false, loaderOptions = {}} = options.css || {};

        const shouldExtract = extract !== false;
        const filename = getAssetPath(options, `css/[name]${options.filenameHashing ? '.[contenthash:8]' : ''}.css`);
        const extractOptions = Object.assign(
            {
                filename,
                chunkFilename: filename
            },
            extract && typeof extract === 'object' ? extract : {}
        );

        const cssPublicPath = '../'.repeat(
            extractOptions.filename.replace(/^\.[\/\\]/, '').split(/[\/\\]/g).length - 1
        );

        // check if the project has a valid postcss config
        // if it doesn't, don't use postcss-loader for direct style imports
        // because otherwise it would throw error when attempting to load postcss config
        const hasPostCSSConfig = !!(
            api.service.pkg.postcss ||
            findExisting(api.resolve('.'), [
                '.postcssrc',
                '.postcssrc.js',
                'postcss.config.js',
                '.postcssrc.yaml',
                '.postcssrc.json'
            ])
        );

        // if building for production but not extracting CSS, we need to minimize
        // the embbeded inline CSS as they will not be going through the optimizing
        // plugin.
        const needInlineMinification = isProd && !shouldExtract;

        const cssnanoOptions = {
            safe: true,
            autoprefixer: {disable: true},
            mergeLonghand: false
        };
        if (options.productionSourceMap && sourceMap) {
            cssnanoOptions.map = {inline: false};
        }

        function createCSSRule(lang, test, loader, options) {
            const baseRule = webpackConfig.module.rule(lang).test(test);
            baseRule.exclude.add(/@baidu\/hulk/);
            applyLoaders(baseRule, modules);

            function applyLoaders(rule, modules) {
                if (shouldExtract) {
                    rule.use('extract-css-loader')
                        .loader(require('mini-css-extract-plugin').loader)
                        .options({
                            publicPath: cssPublicPath
                        });
                } else {
                    rule.use('style-loader').loader(require.resolve('style-loader'));
                }

                const cssLoaderOptions = Object.assign(
                    {
                        sourceMap,
                        importLoaders:
                            1 + // stylePostLoader injected by vue-loader
                            (hasPostCSSConfig ? 1 : 0) +
                            (needInlineMinification ? 1 : 0)
                    },
                    loaderOptions.css
                );

                if (modules) {
                    const {localIdentName = '[name]_[local]_[hash:base64:5]'} = loaderOptions.css || {};
                    Object.assign(cssLoaderOptions, {
                        modules,
                        localIdentName
                    });
                }

                rule.use('css-loader')
                    .loader(require.resolve('css-loader'))
                    .options(cssLoaderOptions);

                if (hasPostCSSConfig) {
                    rule.use('postcss-loader')
                        .loader(require.resolve('postcss-loader'))
                        .options(Object.assign({sourceMap}, loaderOptions.postcss));
                }

                if (loader) {
                    rule.use(loader)
                        .loader(require.resolve(loader))
                        .options(Object.assign({sourceMap}, options));
                }
            }
        }
        createCSSRule('css', /\.css$/);
        createCSSRule('postcss', /\.p(ost)?css$/);
        createCSSRule('scss', /\.scss$/, 'sass-loader', loaderOptions.sass);
        createCSSRule(
            'sass',
            /\.sass$/,
            'sass-loader',
            Object.assign(
                {
                    indentedSyntax: true
                },
                loaderOptions.sass
            )
        );
        createCSSRule('less', /\.less$/, 'less-loader', loaderOptions.less);
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

        // inject CSS extraction plugin
        if (shouldExtract) {
            webpackConfig.plugin('extract-css').use(require('mini-css-extract-plugin'), [extractOptions]);

            // minify extracted CSS
            if (isProd) {
                webpackConfig.plugin('optimize-css').use(require('@intervolga/optimize-cssnano-plugin'), [
                    {
                        sourceMap: options.productionSourceMap && sourceMap,
                        cssnanoOptions
                    }
                ]);
            }
        }
    });
};
