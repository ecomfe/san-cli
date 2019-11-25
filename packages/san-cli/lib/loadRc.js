/**
 * @file 获取 rc 文件内容
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const cosmiconfig = require('cosmiconfig');

module.exports = (rootSrc = process.cwd()) => {
    // 使用 cosmiconfig 查找
    const explorer = cosmiconfig('san', {
        // 寻找.san文件夹优先于 cwd
        searchPlaces: ['.san/rc.json', '.sanrc', '.sanrc.json']
    });

    const rcResult = explorer.searchSync(rootSrc) || {};
    let rc = {};
    if (rcResult) {
        rc = rcResult.config || {};
    }

    return rc;
};
