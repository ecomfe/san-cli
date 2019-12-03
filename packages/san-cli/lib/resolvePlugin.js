/**
 * @file 通过 basedir 获取 plugin require 路径
 * @author wangyongqing <wangyongqing01@baidu.com>
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
                throw new SError(e);
            }
        }
        return resolve.sync(name, {basedir});
    } catch (err) {
        throw new SError(`\`${name}\` not found!`);
    }
};
