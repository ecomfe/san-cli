/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file evaluate
 * @author ksky521
 */

const {error} = require('san-cli-utils/ttyLogger');
module.exports = (exp, data) => {
    /* eslint-disable no-new-func */
    const fn = new Function('data', 'with (data) { return ' + exp + '}');
    try {
        return fn(data);
    } catch (e) {
        error(`Error when evaluating filter condition: ${exp}`);
    }
};
