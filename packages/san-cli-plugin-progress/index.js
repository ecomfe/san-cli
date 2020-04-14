/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file progress plugin
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = {
    id: 'built-in:plugin-progress',
    apply(api, projectOptions, options = {}) {
        // 添加progress
        api.chainWebpack(webpackConfig => {
            if (options.profile === true) {
                options.reporters = ['fancy'];
                options.reporter = require('./profile');
            }
            // 这里留个小功能：bar 颜色随机
            options.color = require('@baidu/san-cli-utils/randomColor').color;
            webpackConfig.plugin('progress').use(require('webpackbar'), [options]);
        });
    }
};
