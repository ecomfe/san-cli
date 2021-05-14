/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file prompt
 * @author ksky521
 */

const prompts = require('prompts');

// 交互式问询
module.exports = input => {
    if (!Array.isArray(input)) {
        input = [input];
    }
    return prompts(input);
};
