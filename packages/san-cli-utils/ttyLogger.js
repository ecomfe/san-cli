/**
 * @file 跟 tty 输出相关的log
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const stringWidth = require('string-width');
const stripAnsi = require('strip-ansi');
const chalk = require('chalk');
chalk.stripColor = stripAnsi;

const importLazy = require('import-lazy')(require);
const readline = importLazy('readline');
const padStart = importLazy('string.prototype.padstart');

// exports
exports.chalk = chalk;
exports.ora = importLazy('ora');
exports.figures = importLazy('figures');

/* eslint-disable no-console */
const logger = console.log;
const error = console.error;
const warn = console.warn;
function textColor(severity) {
    switch (severity.toLowerCase()) {
        case 'done':
            return 'green';
        case 'info':
            return 'blue';
        case 'note':
            return 'white';
        case 'warn':
            return 'yellow';
        case 'error':
            return 'red';
        default:
            return 'red';
    }
}
function formatType(type) {
    return chalk[bgColor(type)].black('', type.toUpperCase(), '');
}

function formatText(severity, message) {
    return chalk[textColor(severity)](message);
}

function bgColor(severity) {
    const color = textColor(severity);
    return 'bg' + capitalizeFirstLetter(color);
}

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

exports.title = (severity, msg, withTime = true) => {
    const date = new Date();
    const dateString = chalk.grey(date.toLocaleTimeString());
    const titleFormatted = formatType(severity);
    const subTitleFormatted = formatText(severity, msg);
    const message = `${titleFormatted} ${subTitleFormatted}`;
    if (withTime) {
        let logSpace = process.stdout.columns - stringWidth(message) - stringWidth(dateString);
        if (logSpace <= 0) {
            logSpace = 10;
        }
        logger(`${message}${' '.repeat(logSpace)}${dateString}`);
    } else {
        logger(message);
    }

    logger();
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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
