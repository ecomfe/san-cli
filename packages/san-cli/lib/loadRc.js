/**
 * @file 获取 rc 文件内容
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// const path = require('path');
const importLazy = require('import-lazy')(require);
const readPkg = require('./readPkg');
const readRc = require('./readRcFile');
const resolve = importLazy('./resolvePlugin');
const lMerge = importLazy('lodash.merge');

module.exports = (baseDir = process.cwd()) => {
    // 1. 查找 package.json 的文件
    const pkg = readPkg(baseDir);
    // 2. 读取 san, dependencies和 devDependencies
    const {dependencies, devDependencies, san = {}} = pkg || {};
    // 3. 合并 pkg.san 和 dependencies，处理相对路径
    const deps = Object.keys(dependencies || {});
    const devDeps = Object.keys(devDependencies || {});
    let commands = deps.concat(devDeps).filter(name => {
        //  忽略非 san-cli 开头的
        if (!/^san-cli-command-|^@[^/]+\/san-cli-command-/.test(name)) {
            return false;
        }

        // 忽略 @types 和 @babel
        if (/^@(types|babel)\//.test(name)) {
            return false;
        }

        return true;
    });
    commands = (san.commands || [])
        .concat(commands)
        .map(name => {
            // 保证插件存在
            const path = resolve(name, baseDir);
            return path;
        })
        .filter(p => p);
    // 防止 merge
    delete san.commands;
    // 4. 查找 userhome 的 sanrc.json
    // 5. merge全部，返回
    let sanrc = readRc('rc');
    if (sanrc) {
        // concat
        commands = commands.concat(sanrc.commands);
        // 防止 merge
        delete sanrc.commands;
    }
    // 目前只有 commands~
    return lMerge(san, sanrc, {
        // 去重下
        commands
    });
};
