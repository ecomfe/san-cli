/**
 * @file plugin.js
 * @author tanglei02 (tanglei02@baidu.com)
 * @descripton inspired by https://github.com/vuejs/vue-loader/blob/master/lib/plugin.js
 */

const webpack = require('webpack');
let SanLoaderPlugin = null;

if (webpack.version && webpack.version[0] > 4) {
    // webpack5 and upper
    SanLoaderPlugin = require('./plugin-webpack5');
}
else {
    // webpack4 and lower
    SanLoaderPlugin = require('./plugin-webpack4');
}

module.exports = SanLoaderPlugin;
