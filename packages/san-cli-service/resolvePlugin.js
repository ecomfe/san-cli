/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 通过 basedir 获取 plugin require 路径
 * @author ksky521
 */

const SError = require('san-cli-utils/SError');
const resolve = require('resolve');
const fs = require('fs');
const path = require('path');
module.exports = (name, basedir = process.cwd()) => {
    try {
        const p = path.join(basedir, name);
        if (fs.existsSync(p)) {
            // 本地存在
            try {
                require(p);
                return p;
            } catch (e) {
                if (/Cannot find module/.test(e)) {
                    throw new SError(`\`${name}\` not found!`);
                } else {
                    throw new SError(e);
                }
            }
        }
        return resolve.sync(name, {basedir});
    } catch (err) {
        throw new SError(`\`${name}\` not found!`);
    }
};
