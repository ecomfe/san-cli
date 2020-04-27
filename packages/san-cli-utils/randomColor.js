/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file random color 给点 color see see
 * @author ksky521
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
