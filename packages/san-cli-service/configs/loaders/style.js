/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file style-loader options
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const factory = require('./loaderFactory');

module.exports = factory(options => {
    return {
        name: 'style-loader',
        loader: 'style-loader',
        options
    };
});
