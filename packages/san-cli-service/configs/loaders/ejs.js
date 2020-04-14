/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file ejs loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const factory = require('./loaderFactory');

module.exports = factory((options, projectOptions) => {
    return {
        name: 'ejs-loader',
        loader: 'ejs-loader',
        options
    };
});
