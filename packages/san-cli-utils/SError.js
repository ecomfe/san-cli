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
    constructor(msg, type, stack) {
        super(msg || 'San error');
        this.name = type || 'SError';
        if (stack && typeof stack === 'string' || Array.isArray(stack)) {
            this.stack = Array.isArray(stack) ? stack.join('\n') : stack;
        }
        else {
            Error.captureStackTrace(this, SError);
        }

    }
};
