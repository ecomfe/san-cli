/**
 * @file css loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {getAssetPath, getLoaderOptions} = require('../utils');

module.exports = (api, options) => {
    api.chainWebpack(webpackConfig => {
        const isProd = api.isProd();

        const {css = {}, assetsDir = ''} = options;
        const {modules = false, extract = isProd, sourceMap = true} = css;
        const loaderOptions = getLoaderOptions(api, options);
        const shouldExtract = extract !== false;
        const filename = getAssetPath(assetsDir, `css/[name]${isProd ? '.[contenthash:8]' : ''}.css`);
        const chunkFilename = getAssetPath(assetsDir, `css/[name]${isProd ? '.[contenthash:8]' : ''}.css`);
        const extractOptions = Object.assign(
            {
                filename,
                chunkFilename
            },
            extract && typeof extract === 'object' ? extract : {}
        );

        const cssPublicPath = '../'.repeat(extractOptions.filename.replace(/^.[/\\]/, '').split(/[/\\]/g).length - 1);

        const cssLoader = require('./loaders/css')(loaderOptions);
        const styleLoader = require('./loaders/style')(loaderOptions);
        const postcssLoader = require('./loaders/postcss')(loaderOptions);
        const lessLoader = require('./loaders/less')(loaderOptions);

        function createCSSRule(lang, test, ...loaders) {
            const baseRule = webpackConfig.module.rule(lang).test(test);
            // 排除内置的样式
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
                    rule.use(styleLoader.name)
                        .loader(styleLoader.loader)
                        .options(styleLoader.options);
                }

                const cssLoaderOptions = cssLoader.options;

                if (modules) {
                    const {localIdentName = '[name]_[local]_[hash:base64:5]'} = loaderOptions.css || {};
                    Object.assign(cssLoaderOptions, {
                        modules,
                        localIdentName
                    });
                }
                cssLoaderOptions.importLoaders += loaders.length;
                rule.use(cssLoader.name)
                    .loader(cssLoader.loader)
                    .options(cssLoaderOptions);

                if (Array.isArray(loaders)) {
                    loaders.forEach(({name, loader, options}) => {
                        rule.use(name)
                            .loader(loader)
                            .options(options);
                    });
                }
            }
        }
        createCSSRule('css', /\.css$/, postcssLoader);
        createCSSRule('less', /\.less$/, postcssLoader, lessLoader);

        //  hulk buildin css loader
        // prettier-ignore
        /* eslint-disable*/
        webpackConfig.module
            .rule('hulk-css')
            .test(/@baidu\/hulk.+\.css$/)
                .use(styleLoader.name)
                .loader(styleLoader.loader)
            .end()
                .use(cssLoader.name)
                .loader(cssLoader.loader);
        // prettier-ignore
        webpackConfig.module
            .rule('hulk-less')
            .test(/@baidu\/hulk.+\.less$/)
                .use(styleLoader.name)
                .loader(styleLoader.loader)
            .end()
                .use(cssLoader.name)
                .loader(cssLoader.loader)
            .end()
                .use(lessLoader.name)
                .loader(lessLoader.loader)
                .options(lessLoader.options);
        /* eslint-enable*/

        // inject CSS extraction plugin
        if (shouldExtract) {
            webpackConfig.plugin('extract-css').use(require('mini-css-extract-plugin'), [extractOptions]);
        }
    });
};
