/**
 * @file 跟 tty 输出相关的log
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const ConsolaReporter = require('./ConsolaReporter');
const stripAnsi = require('strip-ansi');
const consola = require('consola');
const chalk = require('chalk');
chalk.stripColor = stripAnsi;

const importLazy = require('import-lazy')(require);
const readline = importLazy('readline');

// exports
exports.chalk = chalk;
exports.ora = importLazy('ora');
exports.figures = importLazy('figures');

const logger = consola.create({
    level: process.env.CONSOLA_LEVEL || 3,
    reporters: [new ConsolaReporter()]
});

['fatal', 'ready', 'start', 'error', 'warn', 'log', 'info', 'success', 'debug', 'trace', 'silent'].forEach(k => {
    exports[k] = logger[k];
});
exports.logger = logger;
logger.getScopeLogger = (scope, level = process.env.CONSOLA_LEVEL) => {
    const l = logger.withTag(scope);
    setLevel(level, l);
    return l;
};
exports.getScopeLogger = logger.getScopeLogger;

function setLevel(level, l) {
    level = consola._types[level] ? consola._types[level].level : parseInt(level, 10);
    if (!level) {
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
exports.consola = consola;
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
