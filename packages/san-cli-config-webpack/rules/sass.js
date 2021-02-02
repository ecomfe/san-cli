const createCSSRule = require('./createCSSRule');
const {error} = require('san-cli-utils/ttyLogger');
const semver = require('semver');

module.exports = (
    chainConfig,
    name = 'scss',
    test = /\.scss$/,
    options = {
        requireModuleExtension: true,
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
