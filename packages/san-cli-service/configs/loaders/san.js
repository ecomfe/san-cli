/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file san-loader
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = ({isProd}) => {
    return {
        name: 'san-loader',
        loader: 'san-loader',
        options: {
            // hotReload: !isProd,
            // sourceMap: !isProd,
            // minimize: isProd
        }
    };
};
