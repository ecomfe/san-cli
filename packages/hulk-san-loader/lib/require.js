/**
 * @file 引入 require.cwd 命令
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const resolveCwd = require('resolve-cwd');

module.exports = moduleId => {
    let mod = resolveCwd.silent(moduleId);
    if (!mod) {
        return require.resolve(moduleId);
    }
    return mod;
};
