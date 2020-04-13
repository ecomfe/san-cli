/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file prompt
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const inquirer = require('inquirer');

// 交互式问询
module.exports = input => {
    if (!Array.isArray(input)) {
        input = [input];
    }
    return inquirer.prompt(input);
};
