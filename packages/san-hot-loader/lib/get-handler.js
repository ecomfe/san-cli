/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file get-handler.js
 * @author clark-t
 */

const ComponentHandler = require('./component/component-hmr-handler');
const StoreHandler = require('./store/store-hmr-handler');

const constructors = [
    ComponentHandler,
    StoreHandler
];

module.exports = function (matchOptions) {
    for (const Constructor of constructors) {
        const handler = new Constructor(matchOptions);
        if (!handler.enable) {
            continue;
        }

        const matchResult = handler.match();
        if (!matchResult) {
            continue;
        }

        return handler;
    }
};

