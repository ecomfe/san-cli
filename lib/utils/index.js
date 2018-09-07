/**
 * @file 工具函数导出
 */

[
    'logger',
    'git-user',
    'path',
    'spinner',
    'get-npm-registry',
    'check-version'
].forEach(m => {
    Object.assign(exports, require(`./${m}`));
});

exports.chalk = require('chalk');
