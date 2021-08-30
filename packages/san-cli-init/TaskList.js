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

class Task {
    constructor(taskListInstance, taskFn) {
        this.taskListInstance = taskListInstance;
        this.status = '';
        this.taskFn = taskFn;
    }
    getContext() {
        return this.taskListInstance.getContext();
    }
    run() {
        this.status = 'running';
        this.taskFn(this.getContext(), this);
    }
    skip(reason) {
        this.status = 'skiped'; // running failed
        this.taskListInstance.next({reason, type: 'skip'});
    }
    complete() {
        if (this.status === 'running') {
            this.status = 'done';
            this.taskListInstance.next();
        }
    }
    error(err) {
        if (this.status === 'running') {
            this.status = 'failed';
            this.taskListInstance.fail(err);
        }
    }
    info(data) {
        if (data) {
            this.taskListInstance.startSpinner(data);
        } else {
            this.taskListInstance.stopSpinner();
        }
    }
}

module.exports = class TaskList {
    constructor(tasks, options = {}) {
        this._tasks = tasks;
        this._options = options;
        this._index = 0;
        this._tasksLength = tasks.length;
        this._context = Object.create(null);
        // 这里可以写个状态机
        this._status = 'ready'; // ready, pending, done, fail, running

        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
    startSpinner(text) {
        if (this._spinner.isSpinning) {
            this._spinner.text = text;
        } else {
            this._spinner.start(text);
        }
    }
    stopSpinner() {
        if (this._spinner) {
            this._spinner.stop();
        }
    }

    getContext() {
        return this._context;
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

    _startTask(idx, {reason, type = ''} = {}) {
        let {title, task} = this._tasks[idx];
        this.stopSpinner();
        const p = `[${this._index + 1}/${this.length}]`;
        if (reason) {
            // eslint-disable-next-line no-console
            console.log(chalk.dim(`${new Array(p.length + 1).join(' ')} ${figures.arrowRight} ${reason}`));
        }
        // eslint-disable-next-line no-console
        console.log(chalk.dim(p) + ` ${title}`);

        if (!this._spinner) {
            this._spinner = ora('In processing...', {spinner: 'point'}).start();
        }
        new Task(this, task).run();
    }
    done() {
        this.stopSpinner();
        this._resolve(this._context);
    }
    fail(err) {
        this.stopSpinner();
        this._reject(err);
    }

    next(reason) {
        this._index++;
        if (this._index >= this._tasks.length) {
            // 完成了
            this._setStatus('done');
            this.done();
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
