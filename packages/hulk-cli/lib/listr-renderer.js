/**
 * @file listr renderer 自定义
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const logUpdate = require('log-update');
const chalk = require('chalk');
const figures = require('figures');
const indentString = require('indent-string');
const cliTruncate = require('cli-truncate');
const stripAnsi = require('strip-ansi');
const utils = require('./listr-utils');

const renderHelper = (tasks, options, level) => {
    level = level || 0;

    let output = [];
    let index = 1;
    for (const task of tasks) {
        if (task.isEnabled()) {
            const skipped = task.isSkipped() ? ` ${chalk.dim('[skipped]')}` : '';

            let percentText = '';
            if (level === 0 && options.count) {
                percentText = `[${index}/${options.count}] `;
            }
            let symbol = utils.getSymbol(task, options, level, index);
            // if (symbol && task.isPending() && level !== 0 && options.count) {
            // 	symbol = new Array(Math.floor((percentText.length - 1) / 2)).join('  ') + symbol
            // }
            output.push(indentString(` ${symbol}${task.title}${skipped}`, level, '  '));

            if ((task.isPending() || task.isSkipped() || task.hasFailed()) && utils.isDefined(task.output)) {
                let data = task.output;

                if (typeof data === 'string') {
                    data = stripAnsi(
                        data
                            .trim()
                            .split('\n')
                            .filter(Boolean)
                            .pop()
                    );

                    if (data === '') {
                        data = undefined;
                    }
                }

                if (utils.isDefined(data)) {
                    let out = indentString(`${figures.arrowRight} ${data}`, level, '  ');
                    if (task.isSkipped()) {
                        out = indentString(`${chalk.yellow('Reason')} ${data}`, level + percentText.length / 2, '  ');
                    } else if (task.hasFailed()) {
                        out = indentString(`${chalk.red('Error')} ${data}`, level + percentText.length / 2, '  ');
                    }
                    output.push(`   ${chalk.gray(cliTruncate(out, process.stdout.columns - 3))}`);
                }
            }

            if (
                (task.isPending() || task.hasFailed() || options.collapse === false) &&
                (task.hasFailed() || options.showSubtasks !== false) &&
                task.subtasks.length > 0
            ) {
                output = output.concat(renderHelper(task.subtasks, options, level + 1));
            }
        }
        index++;
    }

    return output.join('\n');
};

const render = (tasks, options) => {
    logUpdate(renderHelper(tasks, options));
};

class UpdateRenderer {
    constructor(tasks, options) {
        this._tasks = tasks;
        this._options = Object.assign(
            {
                showSubtasks: true,
                collapse: true,
                clearOutput: false
            },
            options
        );
    }

    render() {
        if (this._id) {
            // Do not render if we are already rendering
            return;
        }

        this._id = setInterval(() => {
            render(this._tasks, this._options);
        }, 100);
    }

    end(err) {
        if (this._id) {
            clearInterval(this._id);
            this._id = undefined;
        }

        render(this._tasks, this._options);

        if (this._options.clearOutput && err === undefined) {
            logUpdate.clear();
        } else {
            logUpdate.done();
        }
    }
}

module.exports = UpdateRenderer;
