/**
 * @file Consola 订制版
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const debug = require('debug');
const ConsolaReporter = require('./ConsolaReporter');
const Consola = require('consola').Consola;
const chalk = require('chalk');
const figures = require('figures');
const {textColor, bgColor} = require('./randomColor');

const perfDebug = debug('san-cli:pref');
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
            // 只在 DEBUG=san-cli:pref 下面输出性能日志
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
