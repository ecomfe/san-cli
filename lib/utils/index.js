/**
 * @file 工具函数导出
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

['logger', 'git-user', 'path', 'spinner', 'npm', 'eval', 'get-latest-version', 'download-repo'].forEach(m => {
    Object.assign(exports, require(`./${m}`));
});

exports.chalk = require('chalk');
