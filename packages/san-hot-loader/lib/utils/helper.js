/**
 * @file helper.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const path = require('path');

function startsWith(str, prefix) {
    return str.slice(0, prefix.length) === prefix;
}

function isRelativePath(pathname) {
    return !path.isAbsolute(pathname) || startsWith(pathname, './') || startsWith(pathname, '../');
}

function merge(obj1, obj2) {
    return Object.assign({}, obj1, obj2);
}

module.exports = {
    startsWith,
    isRelativePath,
    merge
};

