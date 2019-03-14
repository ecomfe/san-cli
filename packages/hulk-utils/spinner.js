/**
 * @file loading 转圈效果
 */
const ora = require('ora');
const importLazy = require('import-lazy')(require);
const chalk = importLazy('chalk');

const spinner = ora();
let lastMsg = null;

function getDefaultSymbol() {
    return process.platform === 'win32' ? '√' : '✔';
}
const logWithSpinner = (exports.logWithSpinner = (...args) => {
    let symbol;
    let text;
    let color;
    switch (args.length) {
        case 1:
            if (typeof args[0] === 'object') {
                ({symbol, text, color} = args[0]);
            } else {
                text = args[0];
            }
            break;
        case 2:
            [symbol, text] = args;
            break;
        case 3:
            [symbol, text, color] = args;
            break;
        default:
            throw new Error('Invalid arguments: symbol, text, color');
    }

    if (!symbol) {
        symbol = chalk.green(getDefaultSymbol());
    }

    if (lastMsg) {
        spinner.stopAndPersist({
            symbol: lastMsg.symbol,
            text: lastMsg.text
        });
    }

    spinner.text = ' ' + text;
    if (color) {
        spinner.color = color;
    }
    lastMsg = {
        color,
        symbol: symbol + ' ',
        text
    };
    return spinner.start();
});
exports.startSpinner = logWithSpinner;
exports.updateSpinner = (...args) => {
    let symbol;
    let text;
    let color;
    switch (args.length) {
        case 1:
            if (typeof args[0] === 'object') {
                ({symbol, text, color} = args[0]);
            } else {
                text = args[0];
            }
            break;
        case 2:
            [symbol, text] = args;
            break;
        case 3:
            [symbol, text, color] = args;
            break;
        default:
            throw new Error('Invalid arguments: symbol, text, color');
    }
    if (!symbol) {
        symbol = chalk.green(getDefaultSymbol());
    }
    if (color) {
        spinner.color = color;
    }
    spinner.text = ' ' + text;
    lastMsg = {
        symbol: symbol + ' ',
        text,
        color
    };
};

exports.stopSpinner = persist => {
    if (lastMsg && persist !== false) {
        spinner.stopAndPersist({
            symbol: lastMsg.symbol,
            text: lastMsg.text
        });
    } else {
        spinner.stop();
    }
    lastMsg = null;
};

exports.pauseSpinner = () => {
    spinner.stop();
};

exports.resumeSpinner = () => {
    spinner.start();
};
exports.failSpinner = text => {
    spinner.fail(text);
};
exports.successSpinner = text => {
    spinner.succeed(text);
};
