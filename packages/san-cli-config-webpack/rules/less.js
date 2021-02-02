const createCSSRule = require('./createCSSRule');

module.exports = (
    chainConfig,
    name = 'less',
    test = /\.less$/,
    options = {
        requireModuleExtension: true,
        extract: false,
        preprocessor: undefined,
        loaderOptions: {
            style: {},
            css: {},
            less: {
                javascriptEnabled: true,
                compress: false
            }
        },
        sourceMap: false
    }
) => {
    options.preprocessor = 'less';

    createCSSRule(chainConfig, name, test, options);
};
