/**
 * @file tpl.js
 * @author tanglei02 (tanglei02@baidu.com)
 */

const path = require('path');
const genId = require('../utils/gen-id');
const storeClientApiPath = require.resolve('./store-client-api');

function globalStoreActionHmrTpl({
    filePath,
    context
}) {
    const id = genId(filePath, context);

    return `
    if (module.hot) {
        var __SAN_STORE_CLIENT_API__ = require('${storeClientApiPath}');
        module.hot.accept();
        var __SAN_STORE_ID__ = '${id}';
        if (!module.hot.data) {
            __SAN_STORE_CLIENT_API__.wrapAddAction(__SAN_STORE_ID__, require('san-store').store);
        }
        __SAN_STORE_CLIENT_API__.cleanCache(__SAN_STORE_ID__);
    }
    `;
}

function instantStoreActionHmrTpl({
    filePath,
    actionPath,
    context
}) {
    actionPath = path.resolve(context, actionPath);
    const id = genId(actionPath, context);

    return `
    if (module.hot) {
        var __SAN_STORE_ID__ = '${id}';
        var __SAN_STORE_CLIENT_API__ = require('${storeClientApiPath}');
        var __SAN_STORE_INSTANCE__ = module.exports || module.__proto__.exports;
        __SAN_STORE_INSTANCE__ = __SAN_STORE_INSTANCE__.__esModule
            ? __SAN_STORE_INSTANCE__.default
            : __SAN_STORE_INSTANCE__;
        if (!module.hot.data) {
            __SAN_STORE_CLIENT_API__.wrapAddAction(__SAN_STORE_ID__, __SAN_STORE_INSTANCE__);
        }
        module.hot.accept('${actionPath}', function () {
            __SAN_STORE_CLIENT_API__.cleanCache(__SAN_STORE_ID__);
            var __SAN_STORE_ACTIONS__ = require('${actionPath}');
            __SAN_STORE_ACTIONS__ = __SAN_STORE_ACTIONS__.__esModule
                ? __SAN_STORE_ACTIONS__.default
                : __SAN_STORE_ACTIONS__;
            __SAN_STORE_CLIENT_API__.updateActions(__SAN_STORE_INSTANCE__, __SAN_STORE_ACTIONS__);
        });
    }
    `;
}

module.exports = {
    globalStoreActionHmrTpl,
    instantStoreActionHmrTpl
};

