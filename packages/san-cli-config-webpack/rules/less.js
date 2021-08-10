const lMerge = require('lodash.merge');
const createCSSRule = require('./createCSSRule');
const {lessOptions} = require('../defaultOptions');

module.exports = (
    chainConfig,
    name = 'less',
    test = /\.less$/,
    options
) => {
    options = lMerge({preprocessor: 'less'}, lessOptions, options);
    createCSSRule(chainConfig, name, test, options);
};
