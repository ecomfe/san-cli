const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const styleLoaderFactory = require('../loaders/style');
const cssLoaderFactory = require('../loaders/css');
const postcssLoaderFactory = require('../loaders/postcss');
const {error} = require('san-cli-utils/ttyLogger');

module.exports = (
    chainConfig,
    name,
    test,
    {
        requireModuleExtension,
        preprocessor,
        loaderOptions = {},
        extract: shouldExtract,
        sourceMap
    }
) => {
    const styleLoader = styleLoaderFactory(loaderOptions.style);
    const baseRule = chainConfig.module.rule(name).test(test);
    const hasPostCSSConfig = loaderOptions.postcss !== false;

    // rules for *.module.* files
    const extModulesRule = baseRule.oneOf('normal-modules').test(/\.module\.\w+$/);
    applyLoaders(extModulesRule, true);

    // rules for normal CSS imports
    const normalRule = baseRule.oneOf('normal');
    applyLoaders(normalRule, !requireModuleExtension);

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
                loaderOptions.css || {}
            )
        );
        const {loader, options: cssLoaderOptions = {}} = cssLoader;
        if (isCssModule) {
            cssLoaderOptions.modules = {
                localIdentName: '[name]_[local]_[hash:base64:5]',
                ...cssLoaderOptions.modules
            };
        } else {
            delete cssLoaderOptions.modules;
        }

        rule.use('css')
            .loader(loader)
            .options(cssLoaderOptions);

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
                .options(options);
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
