const chalk = require('chalk');
const logSymbols = require('log-symbols');
const figures = require('figures');
const ora = require('ora');

const pointer = chalk.yellow(figures.pointer);
const skipped = chalk.yellow(figures.arrowDown);

exports.isDefined = x => x !== null && x !== undefined;

function getSpinner({spinner = 'point', color = 'green'}) {
    spinner = ora({spinner, color});
    return () => spinner.frame();
}

exports.getSymbol = (task, options, level, index) => {
    if (!task.spinner) {
        task.spinner = getSpinner(options);
    }

    if (task.isPending()) {
        if (level === 0 && !task.hasSubtasks()) {
            return task.spinner();
        }
        let rs = '';

        rs += options.showSubtasks !== false && task.subtasks.length > 0 ? pointer + ' ' : task.spinner();
        return rs;
    }

    // 完成了
    if (task.isCompleted()) {
        return logSymbols.success + ' ';
    }
    // 有错误
    if (task.hasFailed()) {
        return task.subtasks.length > 0 ? pointer : logSymbols.error;
    }

    if (task.isSkipped()) {
        return skipped;
    }

    return chalk.gray(percentText);
};
