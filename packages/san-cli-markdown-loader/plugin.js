/**
 * @file 根据 webpack选择版本
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const webpack = require('webpack');
let Plugin = null;

if (webpack.version[0] > 4) {
    // webpack5 and upper
    Plugin = require('./plugin-5');
} else {
    // webpack4 and lower
    Plugin = require('./plugin-4');
}

module.exports = Plugin;
