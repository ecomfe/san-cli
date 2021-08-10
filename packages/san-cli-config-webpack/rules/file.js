const createRule = require('./createRule');

module.exports = (chainConfig, name, test, options = {}) => {
    createRule(chainConfig, name, test, [['file', options]]);
};
