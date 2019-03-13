/**
 * 部分代码来自 vue cli
 * @file build 主要内容
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = (api, options) => {
    api.registerCommand(
        'build',
        async function build(args) {
            const info = require('@baidu/hulk-utils/logger').info;

            info('Building...');

            process.env.NODE_ENV = 'production';

            const webpack = require('webpack');
            // resolve webpack config
            const webpackConfig = api.resolveWebpackConfig();
            webpackConfig.mode = 'production';
            if (!args.map) {
                delete webpackConfig.devtool; // = null;
            }
            // webpackConfig.output.publicPath = './';
            return new Promise((resolve, reject) => {
                webpack(webpackConfig, err => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        }
    );
};

module.exports.defaultModes = {
    build: 'production'
};
