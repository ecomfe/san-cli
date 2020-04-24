/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 跟 tty 输出相关的log
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const stripAnsi = require('strip-ansi');
const Consola = require('./Consola');
const debug = require('debug');
const {_types: consolaTypes} = require('consola');
const chalk = require('chalk');
chalk.stripColor = stripAnsi;

const importLazy = require('import-lazy')(require);
const readline = importLazy('readline');

// exports
exports.chalk = chalk;
exports.ora = importLazy('ora');
exports.figures = importLazy('figures');

const logger = new Consola();

[
    'fatal',
    'ready',
    'start',
    'error',
    'warn',
    'log',
    'info',
    'success',
    'debug',
    'trace',
    'silent',
    'time',
    'timeEnd'
].forEach(k => {
    exports[k] = logger[k];
});
exports.logger = logger;

logger.getScopeLogger = (scope, level = process.env.CONSOLA_LEVEL) => {
    const l = logger.withTag(scope);
    setLevel(level, l);
    return l;
};
exports.getScopeLogger = logger.getScopeLogger;

exports.getDebugLogger = scope => {
    return scope ? debug(`san-cli:${scope}`) : debug;
};

function setLevel(level, l) {
    level = consolaTypes[level] ? consolaTypes[level].level : parseInt(level, 10);
    if (!level || isNaN(level)) {
        return;
    }

    if (l && typeof l.fatal === 'function' && l.level) {
        return (l.level = level);
    }
    // 设置 logger 的
    logger.level = level;
    process.env.CONSOLA_LEVEL = level;
}
exports.setLevel = setLevel;
// alias
exports.done = logger.success;
exports.warning = logger.warn;

exports.line = msg => {
    console.log();
    msg ? logger('─'.repeat(20) + msg + '─'.repeat(20)) : logger('─'.repeat(45));
    console.log();
};

exports.clearConsole = () => {
    if (process.stdout.isTTY) {
        const blank = '\n'.repeat(process.stdout.rows);
        console.log(blank);
        readline.cursorTo(process.stdout, 0, 0);
        readline.clearScreenDown(process.stdout);
    }
};

exports.boxen = require('boxen');
