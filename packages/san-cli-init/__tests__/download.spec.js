/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file download test
 * @author yanyiting
 */

const hash = require('hash-sum');
const download = require('../tasks/download');
const path = require('path');

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

test('使用本地路径localTemplatePath', async () => {
    await download('https://github.com/yyt/HelloWorld.git', 'none', {})({
        localTemplatePath: 'User/yyt'
    }, task)
        .then(() => {
            expect(task.skipInfo).toEqual(['Use local path `User' + path.sep + 'yyt`']);
            expect(task.res).toBe('done');
        });
});

test('使用本地缓存&&发现本地缓存', async () => {
    await download('exist', 'none', {
        useCache: true
    })({}, task).then(() => {
        expect(task.skipInfo).toEqual(['Discover local cache and use it']);
        expect(task.res).toBe('done');
    });
});

test('远程拉取成功', async () => {
    let ctx = {};
    const template = 'github:yyt/HelloWorld';
    await download(
        template,
        'none',
        {}
    )(ctx, task).then(() => {
        expect(ctx.localTemplatePath).toMatch(path.join('.san', 'templates', hash(template), 'HelloWorld'));
        expect(task.nextInfo).toEqual(['Pulling template from the remote repository...']);
        expect(task.res).toBe('done');
    });
});

test('远程拉取失败', async () => {
    let ctx = {};
    await download(
        '',
        'none',
        {}
    )(ctx, task).then(() => {
    }).catch(e => {
        expect(e.toString()).toEqual(expect.stringMatching(/please check the path and code permissions are correct/));
    });
});
