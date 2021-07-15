/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 将 serve 的 getNormalWbpackConfig
 * @author ksky521
 */

module.exports = function getNormalizeWebpackConfig(api, projectOptions, argv) {
    const {resolveEntry} = require('san-cli-webpack/utils');
    const isProd = api.isProd();
    // 开始正式的操作
    let webpackConfig = api.getWebpackConfig();
    const entry = argv.entry;
    const devServerArgv = {};
    ['https', 'host', 'port', 'publicUrl'].forEach(item => {
        if (argv[item]) {
            devServerArgv[item] = argv[item];
        }
    });

    webpackConfig = resolveEntry(entry, api.resolve(entry), webpackConfig, require.resolve('./public/main.js'));
    webpackConfig.devServer = Object.assign(
        {
            hot: !isProd,
            port: 8888,
            compress: isProd,
            contentBase: projectOptions.outputDir
        },
        webpackConfig.devServer,
        devServerArgv
    );
    return webpackConfig;
};
