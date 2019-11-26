/**
 * @file Consola 订制版
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const ConsolaReporter = require('./ConsolaReporter');
const Consola = require('consola').Consola;
const chalk = require('chalk');

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
        // 添加耗时打点
        const map = new Map();
        this.time = name => {
            map.set(name, Date.now());
        };
        this.timeEnd = name => {
            const start = map.get(name);
            if (start && this.level >= 4) {
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
                    d = chalk.greenBright.bold(`${d}ms`);
                }
                this.debug(`${name}: ${d}`);
            }
        };
    }
};
