/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file bable loader config
 * @author ksky521
 */

const factory = require('./loaderFactory');
module.exports = factory(() => ({
    name: 'babel-loader',
    loader: require.resolve('babel-loader'),
    options: {
        presets: require.resolve('san-cli-plugin-babel/preset')
    }
}));
