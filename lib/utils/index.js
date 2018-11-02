/**
 * @file 工具函数导出
 */

[
    'logger',
    'git-user',
    'path',
    'spinner',
    'npm',
    'eval',
    'get-latest-version',
    'download-repo'
].forEach(m => {
    Object.assign(exports, require(`./${m}`));
});

exports.chalk = require('chalk');
