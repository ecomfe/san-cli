/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file taskList 类
 * @author ksky521
 */

const {ora, figures, chalk} = require('san-cli-utils/ttyLogger');
const SError = require('san-cli-utils/SError');

module.exports = class TaskList {
    constructor(tasks, options = {}) {
        this._tasks = tasks;
        this._options = options;
        this._index = 0;
        this._tasksLength = tasks.length;
        this._context = {};
        // 这里可以写个状态机
        this._status = 'ready'; // ready, pending, done, fail, running

        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    _setStatus(status) {
        switch (status) {
            case 'ready':
                // 不能设置状态
                throw new SError(`Error status: ${this._status} → ${status}`);
            case 'running':
                if (!['ready', 'pending'].includes(this._status)) {
                    throw new SError(`Error status: ${this._status} → ${status}`);
                }
                break;
            case 'pending':
                if (!['running'].includes(this._status)) {
                    throw new SError(`Error status: ${this._status} → ${status}`);
                }
                break;
            case 'done':
            case 'fail':
                if (['done', 'fail', 'ready'].includes(this._status)) {
                    // 这几种状态不能重设了
                    throw new SError(`Error status: ${this._status} → ${status}`);
                }
                break;
            default:
                throw new SError('Error status: ' + status);
        }
        this._status = status;
    }

    run() {
        this._setStatus('running');
        this._startTask(0);
        return this._promise;
    }

    _taskWrapper(task) {
        task.skip = reason => {
            task.status = 'skiped'; // running failed
            this.next({reason, type: 'skip'});
        };
        task.info = data => {
            if (data) {
                if (this._spinner.isSpinning) {
                    this._spinner.text = data;
                } else {
                    this._spinner.start(data);
                }
            } else {
                this._spinner.stop();
            }
        };
        task.error = err => {
            if (task.status === 'running') {
                task.status = 'failed';
                this._fail(err);
            }
        };
        task.complete = () => {
            if (task.status === 'running') {
                task.status = 'done';
                this.next();
            }
        };
        return task(this._context, task);
    }
    _startTask(idx, {reason, type = ''} = {}) {
        let {title, task} = this._tasks[idx];
        if (this._spinner) {
            this._spinner.stop();
        }
        const p = `[${this._index + 1}/${this.length}]`;
        if (reason) {
            console.log(chalk.dim(`${new Array(p.length + 1).join(' ')} ${figures.arrowRight} ${reason}`));
        }
        console.log(chalk.dim(p) + ` ${title}`);

        if (!this._spinner) {
            this._spinner = ora('In processing...', {spinner: 'point'}).start();
        }
        task.status = 'running';
        this._taskWrapper(task);
    }
    _done() {
        this._spinner.stop();
        this._resolve(this._context);
    }
    _fail(err) {
        this._spinner.stop();
        this._reject(err);
    }
    next(reason) {
        this._index++;
        if (this._index >= this._tasks.length) {
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
