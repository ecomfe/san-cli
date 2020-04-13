/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file color 相关
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const chalk = require('chalk');
// eslint-disable-next-line
const colorMap = new Map();

function chalkColor(name) {
    let color = colorMap.get(name);
    if (color) {
        return color;
    }

    if (name[0] === '#') {
        color = chalk.hex(name);
    } else {
        color = chalk[name] || chalk.keyword(name);
    }

    colorMap.set(name, color);
    return color;
}
exports.chalkColor = chalkColor;

// eslint-disable-next-line
const bgColorMap = new Map();

function chalkBgColor(name) {
    let color = bgColorMap.get(name);
    if (color) {
        return color;
    }

    if (name[0] === '#') {
        color = chalk.bgHex(name);
    } else {
        color = chalk['bg' + name[0].toUpperCase() + name.slice(1)] || chalk.bgKeyword(name);
    }

    bgColorMap.set(name, color);
    return color;
}

exports.chalkBgColor = chalkBgColor;
