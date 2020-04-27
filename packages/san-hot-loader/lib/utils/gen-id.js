/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file gen-id.js
 * @author clark-t
 */

const path = require('path');
const hash = require('hash-sum');
const cache = Object.create(null);
const sepRE = new RegExp(path.sep.replace('\\', '\\\\'), 'g');

module.exports = function (file, context) {
    const contextPath = context.split(path.sep);
    const rootId = contextPath[contextPath.length - 1];
    file = rootId + '/' + path.relative(context, file).replace(sepRE, '/');
    if (!cache[file]) {
        cache[file] = hash(file);
    }
    return cache[file];
};

