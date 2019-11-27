/**
 * @file 获取 rc 文件内容
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const importLazy = require('import-lazy')(require);
const cosmiconfig = importLazy('cosmiconfig');
const fse = importLazy('fs-extra');
const readPkg = require('./readPkg');

const {findExisting} = require('san-cli-utils/path');
const {error, logger} = require('san-cli-utils/ttyLogger');

module.exports = (rootSrc = process.cwd()) => {
    const searchPlaces = ['.sanrc', '.sanrc.json', '.sanrc.js'];
    // 1. 查找rootSrc 的文件
    let rcpath = findExisting(searchPlaces, rootSrc);
    if (rcpath) {
        logger.debug('在 cwd 目录找到 rc 文件', rcpath);
        // js require
        if (path.extname(rcpath) === '.js') {
            try {
                return require(rcpath);
            } catch (e) {
                error(`Load sanrc file error at ${rcpath}`);
                error(e);
                return;
            }
        }
        // json
        return fse.readJsonSync(rcpath);
    }
    // 2. 查找 package.json 的文件
    const pkg = readPkg(rootSrc);
    if (pkg.san) {
        logger.debug('在 cwd 目录找到 package.json 的 sanrc 配置', rcpath);
        return pkg.san;
    }
    // 3. 使用 cosmiconfig 从上层开始查找，找到用户目录结束
    // 使用 cosmiconfig 查找
    const explorer = cosmiconfig('san', {
        searchPlaces
    });

    const rcResult = explorer.searchSync(path.dirname(rootSrc)) || {};
    let rc = {};
    if (rcResult) {
        rc = rcResult.config || {};
    }

    return rc;
};
