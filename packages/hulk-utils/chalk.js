/**
 * @file chalk 设置 color
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const chalk = require('chalk');
const stripAnsi = require('strip-ansi');
chalk.stripColor = stripAnsi;
module.exports = chalk;
