/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file helper.js
 * @author clark-t
 */

const path = require('path');

function startsWith(str, prefix) {
    return str.slice(0, prefix.length) === prefix;
}

function isRelativePath(pathname) {
    return !path.isAbsolute(pathname) || startsWith(pathname, './') || startsWith(pathname, '../');
}

function merge(obj1, obj2) {
    return Object.assign({}, obj1, obj2);
}

module.exports = {
    startsWith,
    isRelativePath,
    merge
};

