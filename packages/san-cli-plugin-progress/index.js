/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file progress plugin
 * @author ksky521
 */

module.exports = {
    id: 'built-in:plugin-progress',
    apply(api, options = {}) {
        // 添加progress
        api.chainWebpack(webpackConfig => {
            if (options.profile === true) {
                options.reporters = ['fancy'];
                options.reporter = require('./profile');
            }
            webpackConfig.plugin('progress').use(require('webpackbar'), [options]);
        });
    }
};
