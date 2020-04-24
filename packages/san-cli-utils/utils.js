/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 工具函数
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fs = require('fs');
exports.flatten = arr => (arr || []).reduce((prev, curr) => prev.concat(curr), []);
exports.isDirectoryAndNotCwd = p => {
    if (p && typeof p === 'string') {
        const abs = path.resolve(p);
        const cwd = process.cwd();
        if (cwd !== abs) {
            const stat = fs.statSync(abs);
            if (stat.isDirectory()) {
                return abs;
            }
        }
    }
    return false;
};
