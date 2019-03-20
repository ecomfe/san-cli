/**
 * @file run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = (entry, cmd) => {
    // 1. 判断 entry 是 app.san app.js index.js等？还是目录
    // 目录直接操作
    // 如果是文件，需要设置 entry('app'),~entry
    require('@baidu/hulk-serve').build(entry, cmd);
};
