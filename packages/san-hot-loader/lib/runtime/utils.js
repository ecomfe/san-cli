/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file runtime utils
 * @author tanglei02 (tanglei02@baidu.com)
 */

function esm(obj) {
    return obj.__esModule ? obj.default : obj;
}

function getExports(mod) {
    return esm(mod.exports || Object.getPrototypeOf(mod).exports);
}

module.exports = {
    esm: esm,
    getExports: getExports
};

