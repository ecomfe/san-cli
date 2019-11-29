/**
 * @file 通过 basedir 获取 plugin require 路径
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {SError} = require('san-cli-utils/SError');
const resolve = require('resolve');
module.exports = (name, basedir = process.cwd()) => {
    try {
        return resolve.sync(name, {basedir});
    } catch (err) {
        throw new SError(`[${name}] not found!`);
    }
};
