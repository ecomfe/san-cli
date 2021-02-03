// const resolve = require('resolve');
const createOneOfRule = require('./createOneOfRule');

const defaultOptions = {
    // encoding: 'base64',
    iesafe: false,
    limit: 1024,
    noquotes: true,
    esModule: false
};

module.exports = (chainConfig, name = 'svg', test = /\.svg(\?.*)?$/, options = {}) => {
    // 默认是svg-url
    // 如果?sprite 则走svg-sprite
    options = {
        ...defaultOptions,
        ...options
    };
    createOneOfRule(chainConfig, name, test, [
        {name: 'normal', loader: 'svg', options},
        {name: 'sprite', loader: 'svg-sprite', resourceQuery: /\?sprite/i, options}
    ]);
};
