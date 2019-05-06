/**
 * @file 生成 id
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const hash = require('hash-sum');
const cache = Object.create(null);
const sepRE = new RegExp(path.sep.replace('\\', '\\\\'), 'g');

module.exports = function genId(file) {
    file = file.replace(sepRE, '/');
    return cache[file] || (cache[file] = hash(file));
};
