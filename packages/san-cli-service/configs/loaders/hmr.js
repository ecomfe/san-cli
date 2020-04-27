/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file hmr loader options
 * @author clark-t
 */

const factory = require('./loaderFactory');

module.exports = factory((options, projectOptions) => {
    return {
        name: 'san-hot-loader',
        loader: 'san-hot-loader',
        options
    };
});
