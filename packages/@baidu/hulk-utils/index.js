/**
 * @file 工具函数导出
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

[
    'logger',
    'git-user',
    'path',
    'spinner',
    'npm',
    'eval',
    'new-version-log',
    'get-latest-version',
    'download-repo',
    'get-debug',
    'plugin',
    'prepare-urls',
    'webpack-error',
    'find-existing'
].forEach(m => {
    Object.assign(exports, require(`./lib/${m}`));
});

exports.chalk = require('chalk');
