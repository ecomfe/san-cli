/**
 * @file random color 给点 color see see
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {chalkColor, chalkBgColor} = require('./color');
const chalk = require('chalk');
const COLORS = ['orange', 'blueBright', 'cyanBright', 'magentaBright', '#ED6A5E', '#FFAC00', '#62C554'];
const LEN = COLORS.length;
let color = COLORS[Math.floor(Math.random() * LEN)];
exports.color = color;
exports.textColor = txt => chalkColor(color)(txt);
exports.textBold = txt => chalk.bold(chalkColor(color)(txt));
exports.bgColor = txt => chalkBgColor(color)(txt);
