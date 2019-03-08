/**
 * @file taskList 类
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const ora = require('ora');
const chalk = require('chalk');
const figures = require('figures');
module.exports = class TaskList {
    constructor(tasks, options = {}) {
        this._tasks = tasks;
        this._options = options;
        this._index = 0;
        this._tasksLength = tasks.length;
        // 这里可以写个状态机
        this._status = 'ready'; // ready, pending, done, fail, running
    }

    _setStatus(status) {
        switch (status) {
            case 'ready':
                // 不能设置状态
                throw new Error(`Error status: ${this._status} → ${status}`);
            case 'running':
                if (!['ready', 'pending'].includes(this._status)) {
                    throw new Error(`Error status: ${this._status} → ${status}`);
                }
                break;
            case 'pending':
                if (!['running'].includes(this._status)) {
                    throw new Error(`Error status: ${this._status} → ${status}`);
                }
                break;
            case 'done':
            case 'fail':
                if (['done', 'fail', 'ready'].includes(this._status)) {
                    // 这几种状态不能重设了
                    throw new Error(`Error status: ${this._status} → ${status}`);
                }

                break;
            default:
                throw new Error('Error status: ' + status);
        }
        this._status = status;
    }

    run() {
        this._setStatus('running');
        this._startTask(0);

        return new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
    skip(reason) {
        this.next({reason, type: 'skip'});
    }
    _taskWrapper(task) {
        return task(this._context, this);
    }
    _startTask(idx, {reason, type = ''} = {}) {
        let {title, task} = this._tasks[idx];
        if (this._spinner) {
            this._spinner.stop();
        }
        const skipped = type === 'skip' ? ` ${chalk.dim('[skipped]')}` : '';

        console.log(`${chalk.dim(`[${this._index + 1}/${this.length}]`)} ${title}${skipped}`);
        if (reason) {
            console.log(` ${figures.arrowRight} ${reason}`);
        }
        if (!this._spinner) {
            this._spinner = ora('正在处理中...').start();
        }
        this._taskWrapper(task).subscribe({
            next: data => {
                if (data) {
                    if (this._spinner.isSpinning) {
                        this._spinner.text = data;
                    } else {
                        this._spinner.start(data);
                    }
                } else {
                    this._spinner.stop();
                }
            },
            error: err => {
                this._fail(err);
            },
            complete: () => {
                this.next();
            }
        });
    }
    _done() {
        // TODO 清理屏幕
        this._spinner.stop();
        this._resolve(this._context);
    }
    _fail(err) {
        // TODO 清理屏幕
        // TODO 显示 Error
        this._spinner.stop();
        this._reject(err);
    }
    next(reason) {
        this._index++;
        if (this._index === this._tasks.length) {
            // 完成了
            this._setStatus('done');
            this._done();
        } else {
            this._startTask(this._index, reason);
        }
    }
    getIndex() {
        return this._index;
    }
    get status() {
        return this._status;
    }
    get index() {
        return this._index;
    }
    get length() {
        return this._tasks.length;
    }
};
