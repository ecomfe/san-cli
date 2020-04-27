/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file Consola 订制版
 * @author ksky521
 */

const debug = require('debug');
const ConsolaReporter = require('./ConsolaReporter');
const Consola = require('consola').Consola;
const chalk = require('chalk');
const figures = require('figures');
const {textColor, bgColor} = require('./randomColor');

const perfDebug = debug('san-cli:perf');
module.exports = class SanConsola extends Consola {
    constructor(options = {}) {
        options = Object.assign(
            {
                level: process.env.CONSOLA_LEVEL || 3,
                reporters: [new ConsolaReporter()]
            },
            options
        );

        super(options);
        // 扩展命令
        // 增加两个常用的方法
        this.textColor = textColor;
        this.bgColor = bgColor;
        // 添加耗时打点
        /* eslint-disable no-undef */
        const map = new Map();
        /* eslint-enable no-undef */
        this.time = name => {
            map.set(name, Date.now());
        };

        this.timeEnd = name => {
            // 只在 DEBUG=san-cli:perf 下面输出性能日志
            if (perfDebug.enabled) {
                const start = map.get(name);
                if (!start) {
                    return;
                }
                // debug 输出
                let d = Date.now() - start;
                if (d >= 1e3) {
                    // red
                    d = chalk.redBright.bold(`${d}ms`);
                } else if (d >= 3e2) {
                    // warn
                    d = chalk.yellowBright.bold(`${d}ms`);
                } else {
                    // green
                    d = chalk.greenBright(`${d}ms`);
                }
                this.log(`${chalk.grey(figures.play)} ${name}: ${d}`);
            }
        };
    }
};
