/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file installDep test
 * @author yanyiting
 */

jest.mock('rxjs');
jest.mock('inquirer');

const inquirer = require('inquirer');
const installDep = require('../tasks/installDep');

function Task() {
    this.str = '';
    this.skip = data => {
        this.str = data;
    };
}

let task;
beforeEach(() => {
    task = new Task();
});

test('不安装依赖', async () => {
    inquirer.prompt.mockResolvedValueOnce({install: false});

    await installDep('https://github.com/yyt/HelloWorld.git', 'none', {})({}, task)
        .then(data => {
            expect(task.str).toBe('Not install dependencies');
            expect(data.complete).toBeTruthy();
        });
});

test('用户选择安装依赖', async () => {
    inquirer.prompt.mockResolvedValueOnce({install: true});

    await installDep('https://github.com/yyt/HelloWorld.git', 'none', {})({}, task)
        .then(data => {
            expect(data).toEqual({
                next: [undefined, 'Installing dependencies...'],
                error: '',
                complete: true
            });
        });
});
