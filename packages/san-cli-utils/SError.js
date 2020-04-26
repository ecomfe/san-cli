/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file Error class
 * @author ksky521
 */

module.exports = class SError extends Error {
    constructor(msg) {
        super(msg || 'San error');
        this.name = 'SError';
        Error.captureStackTrace(this, SError);
    }
};
