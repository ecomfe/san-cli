/**
 * @file installDep test
 * @author yanyiting <yanyiting@baidu.com>
 */

jest.mock('rxjs');
jest.mock('inquirer');

import rxjs from 'rxjs';
import inquirer from 'inquirer';
import installDep from '../tasks/installDep';

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
            expect(task.str).toBe('用户选择不安装依赖');
            expect(data.complete).toBeTruthy();
        });
});

test('用户选择安装依赖', async () => {
    inquirer.prompt.mockResolvedValueOnce({install: true});

    await installDep('https://github.com/yyt/HelloWorld.git', 'none', {})({}, task)
        .then(data => {
            expect(data).toEqual({
                next: [undefined, '安装依赖ing...'],
                error: '',
                complete: true
            });
        });
});
