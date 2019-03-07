/**
 * @file lib/utils
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');

exports.toPlugin = id => ({id, apply: require(id)});


exports.getAssetPath = (options, filePath, placeAtRootIfRelative) =>
    options.assetsDir ? path.posix.join(options.assetsDir, filePath) : filePath;

exports.resolveLocal = function resolveLocal(...args) {
    return path.join(__dirname, '../../', ...args);
};

