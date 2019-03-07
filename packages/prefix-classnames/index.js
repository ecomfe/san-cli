/**
 * @file index.js
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const classNames = require('classnames');

module.exports = (prefix, space = '-') => {
    if (!prefix) {
        return classNames;
    }
    return (...args) => {
        let cls = classNames.apply(null, args);
        if (cls !== '') {
            cls = cls.split(/\s+/).map(s => [prefix, s].join(space));
            return [prefix, ...cls].join(' ');
        } else {
            return prefix;
        }
    };
};
