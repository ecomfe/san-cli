/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @author harttle
 */

module.exports = function (options) {
    const context = Object.assign({callback, runLoader, resourceQuery: '?'}, options);
    return context;

    function runLoader(loader, source) {
        loader.call(context, source);
        return context;
    }

    function callback(error, code, sourceMap) {
        context.error = error;
        context.code = code;
        context.resourceMap = sourceMap;
    }
};
