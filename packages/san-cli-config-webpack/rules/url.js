// const resolve = require('resolve');
const createRule = require('./createRule');

module.exports = (chainConfig, name, test, options = {}) => {
    createRule(chainConfig, name, test, [['url', options]]);
};
