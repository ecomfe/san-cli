/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file webpack build
 * @author ksky521
 */

const webpack = require('webpack');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const SanFriendlyErrorsPlugin = require('./lib/SanFriendlyErrorsPlugin');
const {getWebpackErrorInfoFromStats} = require('./utils');
const debug = getDebugLogger('webpack:build');
const closeDevtoolDebug = getDebugLogger('webpack:closeDevtool');

module.exports = function build({webpackConfig, compilerCallback}) {
    webpackConfig.plugins.push(new SanFriendlyErrorsPlugin());

    return new Promise((resolve, reject) => {
        debug('start');

        if (closeDevtoolDebug.enabled) {
            // 使用DEBUG=san-cli:webpack:closeDevtool 开启
            webpackConfig.devtool = false;
            webpackConfig.optimization = {
                minimize: false
            };
        }

        const compiler = webpack(webpackConfig);

        if (typeof compilerCallback === 'function') {
            compilerCallback(compiler);
        }

        const callback = (err, stats) => {
            if (err || stats.hasErrors()) {
                debug(err);
                let errorInfo;
                if (stats.hasErrors()) {
                    errorInfo = stats.toJson();
                    debug(errorInfo.errors);
                }

                reject(getWebpackErrorInfoFromStats(err, stats));
                const isWatch = webpackConfig.watch;
                if (isWatch) {
                    debug(err || errorInfo.errorInfo);
                    process.exit(1);
                }
                return;
            }

            resolve({stats});
        };
        if (webpackConfig.watch === true) {
            const watchOptions = webpackConfig.watchOptions || {};
            return compiler.watch(watchOptions, callback);
        }
        try {
            compiler.run(callback);
        }
        catch (e) {
            reject(e);
        }
    });
};
