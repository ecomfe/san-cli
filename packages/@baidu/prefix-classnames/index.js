/**
 * @file index.js
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const classnames = require('classnames');

module.exports = (prefix, space = '-') => {
    return (...args) => {
        const cls = classnames(...args);
        cls.split(/\s+/).map(s => [prefix, s].join(space));
    };
};
