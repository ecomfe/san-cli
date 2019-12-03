/**
 * @file utils
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const importLazy = require('import-lazy')(require);
const resolveCwd = importLazy('resolve-cwd');
const importCwd = importLazy('import-cwd');

function validate(mod) {
    if (mod && typeof mod === 'object') {
        if (typeof mod.handler === 'function' && typeof mod.command === 'string') {
            return true;
        }
    }
    return false;
}

exports.validate = validate;

exports.requireFromLocal = cmd => {
    let localModule = importCwd.silent(cmd);
    let filepath;
    if (!localModule) {
        try {
            filepath = path.resolve(cmd);
            localModule = require(filepath);
        } catch (e) {
            localModule = undefined;
        }
    }
    if (localModule && validate(localModule)) {
        // 优先使用本地的
        return filepath ? filepath : resolveCwd.silent(cmd);
    }
    return null;
};
