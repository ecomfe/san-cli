const chalk = require('chalk');
const logSymbols = require('log-symbols');
const figures = require('figures');
const ora = require('ora');

const pointer = chalk.yellow(figures.pointer);
const skipped = chalk.yellow(figures.arrowDown);

exports.isDefined = x => x !== null && x !== undefined;

function getSpinner(type = 'line2') {
    const spinner = ora({spinner: type});
    return () => spinner.frame();
}

exports.getSymbol = (task, options, level, index) => {
    if (!task.spinner) {
        task.spinner = getSpinner(options.spinner);
    }
    let percentText = ' ';
    if (options.count) {
        percentText = `[${index}/${options.count}] `;
    }
    if (task.isPending()) {
        let rs = '';
        if (level === 0 && options.count) {
            rs += chalk.gray(`${percentText}`);
        }
        rs += options.showSubtasks !== false && task.subtasks.length > 0 ? pointer + ' ' : chalk.yellow(task.spinner());
        return rs;
    }

    if (task.isCompleted()) {
        if (options.count && level === 0) {
            return chalk.gray(percentText) + (options.successSymbol ? options.successSymbol : logSymbols.success) + ' ';
        }
        return logSymbols.success + ' ';
    }

    if (task.hasFailed()) {
        return chalk.gray(percentText) + (task.subtasks.length > 0 ? pointer : logSymbols.error) + ' ';
    }

    if (task.isSkipped()) {
        if (level === 0 && options.count) {
            return chalk.gray(percentText + (options.skipSymbol ? options.skipSymbol : figures.arrowRight) + ' ');
        }
        return skipped;
    }

    return chalk.gray(percentText);
};
