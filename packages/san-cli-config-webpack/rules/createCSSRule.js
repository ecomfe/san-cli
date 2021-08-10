const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const styleLoaderFactory = require('../loaders/style');
const cssLoaderFactory = require('../loaders/css');
const esbuildLoaderFactory = require('../loaders/esbuild');
const postcssLoaderFactory = require('../loaders/postcss');
const {error} = require('san-cli-utils/ttyLogger');

module.exports = (
    chainConfig,
    name,
    test,
    {
        preprocessor,
        loaderOptions = {},
        extract: shouldExtract,
        useEsbuild,
        sourceMap
    }
) => {
    const styleLoader = styleLoaderFactory(loaderOptions.style);
    const baseRule = chainConfig.module.rule(name).test(test);
    const hasPostCSSConfig = loaderOptions.postcss !== false;

    // rules for *.module.* files
    const moduleTest = /\.module\.\w+$/;
    const extModulesRule = baseRule.oneOf('normal-modules').test(moduleTest);
    applyLoaders(extModulesRule, true);

    // rules for normal CSS imports
    const normalRule = baseRule.oneOf('normal');
    applyLoaders(normalRule);

    function applyLoaders(rule, isCssModule) {
        if (shouldExtract) {
            rule.use('extract-css')
                .loader(MiniCssExtractPlugin.loader)
                .options(loaderOptions['extract-css']);
        }
        else {
            rule.use('style')
                .loader(styleLoader.loader)
                .options(styleLoader.options);
        }
        const cssLoader = cssLoaderFactory(
            Object.assign(
                {
                    sourceMap,
                    importLoaders:
                        // prettier-ignore
                        1 + (hasPostCSSConfig ? 1 : 0)
                },
                loaderOptions.css
            )
        );
        const {loader, options: cssLoaderOptions = {}} = cssLoader;
        if (isCssModule && typeof cssLoaderOptions.modules.auto === 'undefined') {
            cssLoaderOptions.modules.auto = moduleTest;
        }

        rule.use('css')
            .loader(loader)
            .options(cssLoaderOptions);
        // 使用esbuild压缩css
        if (!shouldExtract && useEsbuild) {
            const {loader: esBuildLoader, options: esbuildLoaderOptions = {}} = esbuildLoaderFactory();
            rule.use('esbuild')
                .loader(esBuildLoader)
                .options(esbuildLoaderOptions)
                .after('css');
        }
        if (hasPostCSSConfig) {
            const {loader, options} = postcssLoaderFactory(
                Object.assign(
                    {
                        sourceMap
                    },
                    loaderOptions.postcss
                )
            );

            rule.use('postcss')
                .loader(loader)
                .options({
                    sourceMap,
                    postcssOptions: {
                        plugins: options.plugins || []
                    }
                });
        }

        if (preprocessor) {
            let loaderFactory;
            try {
                loaderFactory = require(`../loaders/${preprocessor}`)(
                    Object.assign({sourceMap}, loaderOptions[preprocessor] || {})
                );
            } catch (e) {
                error(`Cannot found css preprocessor: ${preprocessor}`);
            }
            const {loader, options} = loaderFactory;
            rule.use(preprocessor)
                .loader(loader)
                .options(options);
        }
    }
};
