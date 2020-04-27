/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file download test
 * @author yanyiting
 */

jest.mock('rxjs');
const download = require('../tasks/download');

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

test('使用本地路径localTemplatePath', async () => {
    await download('https://github.com/yyt/HelloWorld.git', 'none', {})({
        localTemplatePath: 'User/yyt'
    }, task)
        .then(data => {
            expect(task.str).toBe('Use local path `User/yyt`');
            expect(data.complete).toBeTruthy();
        });
});

test('使用本地缓存&&发现本地缓存', async () => {
    await download('exist', 'none', {
        useCache: true
    })({}, task).then(data => {
        expect(task.str).toBe('Discover local cache and use it');
        expect(data.complete).toBeTruthy();
    });
});

test('远程拉取成功', async () => {
    let ctx = {};
    await download(
        'github:yyt/HelloWorld',
        'none',
        {}
    )(ctx, task).then(data => {
        expect(ctx.localTemplatePath).toMatch('.san/templates/HelloWorld');
        expect(data).toEqual({
            next: ['Pulling template from the remote repository...'],
            error: '',
            complete: true
        });
    });
});

test('远程拉取失败', async () => {
    let ctx = {};
    await download(
        '',
        'none',
        {}
    )(ctx, task).then(data => {
    }).catch(e => {
        expect(e.toString()).toEqual(expect.stringMatching(/please check the path and code permissions are correct/));
    });
});
