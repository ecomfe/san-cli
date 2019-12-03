/**
 * @file utils
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const importLazy = require('import-lazy')(require);
const resolveCwd = importLazy('resolve-cwd');
const importCwd = importLazy('import-cwd');

exports.requireFromLocal = cmd => {
    let localModule = importCwd.silent(cmd);
    let filepath;
    if (!localModule) {
        try {
            filepath = path.resolve(cmd);
            localModule = require(filepath);
            return filepath;
        } catch (e) {
            if (/Cannot find module/.test(e)) {
                // 没有找到
                return null;
            } else {
                localModule = undefined;
                filepath = undefined;
            }
        }
    }
    if (localModule) {
        // 优先使用本地的
        return filepath ? filepath : resolveCwd.silent(cmd);
    }
    return null;
};
