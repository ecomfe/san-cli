/**
 * @file 跟 tty 输出相关的log
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const chalk = require('chalk');
const npmlog = require('npmlog');
const stripAnsi = require('strip-ansi');
chalk.stripColor = stripAnsi;

const importLazy = require('import-lazy')(require);
const readline = importLazy('readline');
const padStart = importLazy('string.prototype.padstart');

exports.debug = prefix => {
    const logFactory = fn => {
        if (typeof npmlog[fn] === 'function') {
            const log = npmlog[fn];
            return (pre, ...args) => {
                if (typeof pre !== 'string') {
                    return log(prefix, pre, ...args);
                } else {
                    return log(`${prefix}:${pre}`, ...args);
                }
            };
        }
        return console.log;
    };
    const rs = {};
    ['info', 'warn', 'error'].forEach(k => (rs[k] = logFactory(k)));
    return rs;
};

/* eslint-disable no-console */
const logger = console.log;
const error = console.error;
const warn = console.warn;

const format = (label, msg) => {
    return msg
        .split('\n')
        .map((line, i) => {
            return i === 0 ? `${label} ${line}` : padStart(line, chalk.reset(label).length);
        })
        .join('\n');
};

const chalkTag = msg => chalk.bgBlackBright.white.dim(` ${msg} `);

exports.log = (msg = '', tag = null) => {
    tag ? logger(format(chalkTag(tag), msg)) : logger(msg);
};

exports.info = (msg, tag = null) => {
    logger(format(chalk.bgBlue.black(' INFO ') + (tag ? chalkTag(tag) : ''), msg));
};

exports.done = (msg, tag = null) => {
    logger(format(chalk.bgGreen.black(' DONE ') + (tag ? chalkTag(tag) : ''), msg));
};

exports.warn = (msg, tag = null) => {
    warn(format(chalk.bgYellow.black(' WARN ') + (tag ? chalkTag(tag) : ''), chalk.yellow(msg)));
};

exports.error = (msg, tag = null) => {
    error(format(chalk.bgRed(' ERROR ') + (tag ? chalkTag(tag) : ''), chalk.red(msg)));
    if (msg instanceof Error && msg.stack) {
        error(msg.stack);
    }
};
exports.line = msg => {
    logger();
    msg ? logger('─'.repeat(20) + msg + '─'.repeat(20)) : logger('─'.repeat(45));
    logger();
};
exports.success = (msg, symbol) => {
    if (typeof symbol !== 'string') {
        symbol = process.platform === 'win32' ? '√' : '✔';
    }

    symbol ? logger(format(`${chalk.green(symbol)} `, msg)) : logger(msg);
};

exports.clearConsole = () => {
    if (process.stdout.isTTY) {
        const blank = '\n'.repeat(process.stdout.rows);
        logger(blank);
        readline.cursorTo(process.stdout, 0, 0);
        readline.clearScreenDown(process.stdout);
    }
};

exports.chalk = chalk;
