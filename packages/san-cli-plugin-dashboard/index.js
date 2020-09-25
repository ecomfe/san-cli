/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file dashboard plugin
 * @author jinzhan
 */

module.exports = {
    id: 'built-in:plugin-dashboard',
    apply(api, projectOptions, options = {}) {
        // 添加progress
        api.chainWebpack(webpackConfig => {
            webpackConfig.plugin('dashboard').use(require('./lib/DashboardPlugin'), [options]);
        });
    }
};
