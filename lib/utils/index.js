/**
 * @file 工具函数导出
 */

[
    'logger',
    'gitUser',
    'path',
    'spinner'
].forEach(m => {
    Object.assign(exports, require(`./${m}`));
});

exports.chalk = require('chalk');
