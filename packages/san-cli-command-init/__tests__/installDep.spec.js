/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file installDep test
 * @author yanyiting
 */

jest.mock('inquirer');

const fs = require('fs');
const inquirer = require('inquirer');
const installDep = require('../tasks/installDep');

function Task() {
    this.skipInfo = [];
    this.nextInfo = [];
    this.res = '';
    this.skip = data => {
        this.skipInfo.push(data);
    };
    this.info = data => {
        this.nextInfo.push(data);
    };
    this.error = err => {
        this.res = err;
    };
    this.complete = () => {
        this.res = 'done';
    };
}

let task;
beforeEach(() => {
    task = new Task();
});

test('不安装依赖', async () => {
    inquirer.prompt.mockResolvedValueOnce({install: false});

    await installDep('https://github.com/yyt/HelloWorld.git', 'none', {})({}, task)
        .then(() => {
            expect(task.skipInfo).toEqual(['Not install dependencies']);
            expect(task.res).toBe('done');
        });
});

test('用户选择安装依赖', async () => {
    inquirer.prompt.mockResolvedValueOnce({install: true});

    // package.json无法mock，这里手动创建下临时文件
    const tempDir = '___temp___' + Date.now();
    const tempPkg = tempDir + '/package.json';
    fs.mkdirSync(tempDir);
    fs.writeFileSync(tempPkg, '{"name": "test"}');

    await installDep('https://github.com/yyt/HelloWorld.git', tempDir, {})({
        metaData: {
            installDeps: true
        }
    }, task)
        .then(() => {
            expect(task.nextInfo).toEqual([undefined, 'Installing dependencies...']);
            expect(task.res).toBe('done');
            // 清除临时文件
            fs.unlinkSync(tempPkg);
            fs.rmdirSync(tempDir);
        });
});
