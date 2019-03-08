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
const utils = require('./utils');
const {error, warn} = require('../logger');

const renderHelper = (tasks, options, level) => {
    level = level || 0;

    let output = [];
    let index = 1;
    let total = tasks.length;
    for (const task of tasks) {
        if (task.isEnabled() && (task.isPending() || task.isSkipped() || task.isCompleted() || task.hasFailed())) {
            const skipped = task.isSkipped() ? ` ${chalk.dim('[skipped]')}` : '';

            let percentText = '';
            let symbol = utils.getSymbol(task, options, level, index);

            if (level === 0) {
                // 第一级别的显示进度
                options.total = total;
                percentText = chalk.gray(`[${index}/${total}]`);
                output.push(`${percentText} ${task.title}${skipped}`);
                // 没有下一步的，直接显示个 loading
                if (!task.hasSubtasks() && task.isPending()) {
                    output.push(`${symbol}${options.loadingText ? options.loadingText : 'Loading'}`);
                }
            } else if (level === 1) {
                output.push(`${symbol}${task.title}${skipped}`);
            } else {
                output.push(indentString(` ${symbol}${task.title}${skipped}`, level - 1, '  '));
            }

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
                    let out;
                    // 报错的情况
                    if (task.hasFailed()) {
                        if (level === 0) {
                            // output.push(chalk.bgRed(' ERROR ') + ' ' + data);
                        } else {
                            output.push(indentString(` error ${data}`, level === 0 ? level : level - 1, '  '));
                        }
                    } else {
                        if (level === 0) {
                            out =
                                new Array(Math.floor(percentText.length / 2) - 2).join(' ') +
                                `${figures.arrowRight} ${data}`;
                        } else {
                            out = indentString(` ${figures.arrowRight} ${data}`, level - 1, '  ');
                        }
                        output.push(`  ${chalk.gray(cliTruncate(out, process.stdout.columns - 3))}`);
                    }
                }
            }

            if (
                (task.isPending() || task.hasFailed() || options.collapse === false) &&
                (task.hasFailed() || options.showSubtasks !== false) &&
                task.hasSubtasks()
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
