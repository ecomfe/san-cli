/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file checkStatus test
 * @author yanyiting
 */

jest.mock('rxjs');
jest.mock('inquirer');
const inquirer = require('inquirer');
const checkStatus = require('../tasks/checkStatus');

test('新目录，目录未存在', async () => {
    await checkStatus('https://github.com/yyt/HelloWorld.git', 'none', {})({})
        .then(data => {
            expect(data).toEqual({
                next: ['Start checking target directory status', 'Check the status of the offline template'],
                error: '',
                complete: true
            });
        });
});

test('目录已存在，--force强行删除', async () => {
    await checkStatus('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-template', {
        force: true
    })({}).then(data => {
        expect(data).toEqual({
            next: [
                'Start checking target directory status',
                '--force delete target directory',
                'Check the status of the offline template'
            ],
            error: '',
            complete: true
        });
    });
});

test('在当前目录下 .', async () => {
    // 回答在当前目录创建
    inquirer.prompt.mockResolvedValueOnce({ok: true});
    await checkStatus('https://github.com/yyt/HelloWorld.git', '.', {
        _inPlace: true
    })({}).then(data => {
        expect(data).toEqual({
            next: [
                'Start checking target directory status',
                undefined,
                'Check the status of the offline template'
            ],
            error: '',
            complete: true
        });
    });

    // 回答不在当亲目录创建
    inquirer.prompt.mockResolvedValueOnce({ok: false});
    await checkStatus('https://github.com/yyt/HelloWorld.git', '.', {
        _inPlace: true
    })({}).then(data => {
        expect(data).toEqual({
            next: ['Start checking target directory status', undefined],
            error: '',
            complete: false
        });
    });
});

test('目录已存在，也没有任何指示如何操作已存在的目录', async () => {
    // 选择覆盖
    inquirer.prompt.mockResolvedValueOnce({action: 'overwrite'});
    await checkStatus('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-template', {})({})
        .then(data => {
            expect(data.next[2]).toMatch('Overwrite selected, first delete');
            expect(data.complete).toBeTruthy();
        });

    // 选择取消
    inquirer.prompt.mockResolvedValueOnce({action: false});
    await checkStatus('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-template', {})({})
        .then(data => {
            expect(data.error).toMatch('Cancel overwrite');
            expect(data.complete).toBeFalsy();
        });

    // 选择合并
    inquirer.prompt.mockResolvedValueOnce({action: 'merge'});
    await checkStatus('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-template', {})({})
        .then(data => {
            expect(data).toEqual({
                next: ['Start checking target directory status', undefined, 'Check the status of the offline template'],
                error: '',
                complete: true
            });
        });
});

test('存在离线模板', async () => {
    let ctx = {};
    await checkStatus('exist', 'none', {
        offline: true
    })(ctx).then(data => {
        expect(ctx.localTemplatePath).toMatch('exist');
    });
});

test('不存在离线模板', async () => {
    let ctx = {};
    await checkStatus('https://github.com/yyt/HelloWorld.git', 'none', {
        offline: true
    })(ctx).then(data => {
        expect(data.error).toMatch('Offline scaffolding template path does not exist');
    });
});
