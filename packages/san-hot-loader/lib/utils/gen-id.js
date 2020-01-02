/**
 * @file gen-id.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const path = require('path');
const hash = require('hash-sum');
const cache = Object.create(null);
const sepRE = new RegExp(path.sep.replace('\\', '\\\\'), 'g');

module.exports = function (file, context) {
    const contextPath = context.split(path.sep);
    const rootId = contextPath[contextPath.length - 1];
    file = rootId + '/' + path.relative(context, file).replace(sepRE, '/');
    if (!cache[file]) {
        cache[file] = hash(file);
    }
    return cache[file];
};

