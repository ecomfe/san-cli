const createCSSRule = require('./createCSSRule');

module.exports = (
    chainConfig,
    name = ,
    test,
    options = {
        requireModuleExtension: true,
        extract: false,
        loaderOptions: {
            style: {},
            css: {},
            stylus: {}
        },
        hasPostCSSConfig: false,
        sourceMap: false
    }
) => {
    options.preprocessor = 'stylus';
    createCSSRule(chainConfig, name, test, options);
};
