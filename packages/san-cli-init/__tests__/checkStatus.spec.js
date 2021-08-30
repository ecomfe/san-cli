/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file checkStatus test
 * @author yanyiting
 */

jest.mock('prompts');
const prompts = require('prompts');
const checkStatus = require('../tasks/checkStatus');

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

test('新目录，目录未存在', async () => {
    await checkStatus('https://github.com/yyt/HelloWorld.git', 'none', {})({}, task)
        .then(() => {
            expect(task.nextInfo).toEqual([
                'Start checking target directory status',
                'Check the status of the offline template'
            ]);
            expect(task.res).toBe('done');
        });
});

test('目录已存在，--force强行删除', async () => {
    await checkStatus('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-template', {
        force: true
    })({}, task).then(() => {
        expect(task.nextInfo).toEqual([
            'Start checking target directory status',
            '--force delete target directory',
            'Check the status of the offline template'
        ]);
        expect(task.res).toBe('done');
    });
});

test('在当前目录下执行命令后，回答在当前目录创建', async () => {
    prompts.mockResolvedValueOnce({ok: true});
    await checkStatus('https://github.com/yyt/HelloWorld.git', '.', {
        _inPlace: true
    })({}, task).then(() => {
        expect(task.nextInfo).toEqual([
            'Start checking target directory status',
            undefined,
            'Check the status of the offline template'
        ]);
        expect(task.res).toBe('done');
    });
});

test('在当前目录下执行命令后，回答不在当前目录创建', async () => {
    prompts.mockResolvedValueOnce({ok: false});
    await checkStatus('https://github.com/yyt/HelloWorld.git', '.', {
        _inPlace: true
    })({}, task).then(() => {
        expect(task.nextInfo).toEqual(['Start checking target directory status', undefined]);
        expect(task.res).toBe('');
    });
});

test('目录已存在，回答覆盖', async () => {
    prompts.mockResolvedValueOnce({action: 'overwrite'});
    await checkStatus('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-template', {})({}, task)
        .then(() => {
            expect(task.nextInfo[2]).toMatch('Overwrite selected, first delete');
            expect(task.res).toBe('done');
        });
});

test('目录已存在，回答取消', async () => {
    prompts.mockResolvedValueOnce({action: false});
    await checkStatus('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-template', {})({}, task)
        .then(() => {
            expect(task.res).toMatch('Cancel overwrite');
        });
});

test('目录已存在，回答合并', async () => {
    prompts.mockResolvedValueOnce({action: 'merge'});
    await checkStatus('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-template', {})({}, task)
        .then(() => {
            expect(task.nextInfo).toEqual([
                'Start checking target directory status',
                undefined,
                'Check the status of the offline template'
            ]);
            expect(task.res).toBe('done');
        });
});

test('存在离线模板', async () => {
    let ctx = {};
    await checkStatus('exist', 'none', {
        offline: true
    })(ctx, task).then(() => {
        expect(ctx.localTemplatePath).toMatch('exist');
    });
});

test('不存在离线模板', async () => {
    let ctx = {};
    await checkStatus('https://github.com/yyt/HelloWorld.git', 'none', {
        offline: true
    })(ctx, task).then(() => {
        expect(task.res).toMatch('Offline scaffolding template path does not exist');
    });
});
