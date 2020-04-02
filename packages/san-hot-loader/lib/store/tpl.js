/**
 * @file tpl.js
 * @author tanglei02 (tanglei02@baidu.com)
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

