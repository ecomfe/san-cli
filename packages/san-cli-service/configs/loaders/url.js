/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file url-loader options
 * @author ksky521
 */

const {getAssetPath} = require('san-cli-utils/path'); // eslint-disable-line
const factory = require('./loaderFactory');

module.exports = factory((options, {filenameHashing, assetsDir, largeAssetSize = 1024}) => {
    const dir = options.dir;
    delete options.dir;
    return {
        name: 'url-loader',
        loader: 'url-loader',
        options: Object.assign(
            {
                limit: largeAssetSize,
                noquotes: true,
                esModule: false,
                name: getAssetPath(assetsDir, `${dir}/[name]${filenameHashing ? '.[contenthash:8]' : ''}.[ext]`)
            },
            options
        )
    };
});
