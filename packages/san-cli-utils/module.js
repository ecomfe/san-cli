/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 加载模块
 * @author zttonly
 */

const clearRequireCache = (id, map = new Map()) => {
    const module = require.cache[id];
    if (module) {
        map.set(id, true);
        // Clear children modules
        module.children.forEach(child => {
            if (!map.get(child.id)) {
                clearRequireCache(child.id, map);
            }
        });
        delete require.cache[id];
    }
};

exports.reloadModule = path => {
    // clear cache brefore require
    clearRequireCache(path);
    return require(path);
};
