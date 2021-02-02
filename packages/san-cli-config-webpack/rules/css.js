const createCSSRule = require('./createCSSRule');

module.exports = (
    chainConfig,
    name,
    test,
    options = {
        requireModuleExtension: true,
        extract: false,
        preprocessor: undefined,
        loaderOptions: {
            style: {},
            css: {}
        },
        sourceMap: false
    }
) => {
    createCSSRule(chainConfig, name, test, options);
};
