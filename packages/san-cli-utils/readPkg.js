/**
 * @file cache read package
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const importLazy = require('import-lazy')(require);
const readPkg = importLazy('read-pkg');
const fse = require('fs-extra');
const cache = {};
module.exports = (cwd, useCache = true) => {
    // 处理下
    const src = path.resolve(cwd, 'package.json');
    if (fse.existsSync(src)) {
        if (useCache && cache[src]) {
            return cache[src];
        }
        const pkg = readPkg.sync({cwd});
        if (useCache) {
            cache[src] = pkg;
        }
        return pkg;
    } else {
        return {};
    }
};
