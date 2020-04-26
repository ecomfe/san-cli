/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file normalize-options.js
 * @author clark-t
 */

const {merge} = require('./helper');

module.exports = function (defaultOptions, options) {
    let opts = merge(defaultOptions, options);
    if (opts.pattern && !opts.patterns) {
        opts.patterns = [opts.pattern];
    }
    return opts;
};

