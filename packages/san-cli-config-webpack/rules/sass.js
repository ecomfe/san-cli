const createCSSRule = require('./createCSSRule');

module.exports = (
    chainConfig,
    name = 'scss',
    test = /\.scss$/,
    options = {
        extract: false,
        loaderOptions: {
            style: {},
            css: {}
        },
        sourceMap: false
    }
) => {
    // 添加 scss 逻辑
    options.preprocessor = 'sass';
    createCSSRule(chainConfig, name, test, options);
};
