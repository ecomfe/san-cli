/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file html-loader
 * @author ksky521
 */

const factory = require('./loaderFactory');
module.exports = factory(
    (options, projectOptions) => {
        return {
            name: 'html-loader',
            loader: 'html-loader',
            options
        };
    },
    {
        attrs: [':data-src']
    }
);
