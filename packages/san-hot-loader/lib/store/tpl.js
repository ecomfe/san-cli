/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file tpl.js
 * @author clark-t
 */

const path = require('path');
const genId = require('../utils/gen-id');
const storeClientApiPath = require.resolve('../runtime/store-client-api');
const runtimeUtilPath = require.resolve('../runtime/utils');

module.exports = function ({
    resourcePath
}) {
    const context = path.dirname(resourcePath);
    const id = genId(resourcePath, context);
    return `
    if (module.hot) {
        var __SAN_STORE_ID__ = '${id}';
        var __SAN_STORE_CLIENT_API__ = require('${storeClientApiPath}');
        var __UTILS__ = require('${runtimeUtilPath}');
        module.hot.accept();
        var __SAN_STORE_INSTANCE__ = __UTILS__.getExports(module) || require('san-store').store;
        __SAN_STORE_CLIENT_API__.update(__SAN_STORE_ID__, __SAN_STORE_INSTANCE__);
    }
    `;
};

