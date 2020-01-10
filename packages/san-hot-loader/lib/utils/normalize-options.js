/**
 * @file normalize-options.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const {merge} = require('./helper');

module.exports = function (defaultOptions, options) {
    let opts = merge(defaultOptions, options);
    if (opts.pattern && !opts.patterns) {
        opts.patterns = [opts.pattern];
    }
    return opts;
};

