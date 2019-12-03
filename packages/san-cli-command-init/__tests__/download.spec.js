/**
 * @file download test
 * @author yanyiting <yanyiting@baidu.com>
 */

jest.mock('rxjs');

import rxjs from 'rxjs';
import download from '../tasks/download';

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
            expect(task.str).toBe('本次使用本地路径');
            expect(data.complete).toBeTruthy();
        });
});

test('使用本地缓存&&发现本地缓存', async () => {
    await download('exist', 'none', {
        useCache: true
    })({}, task)
        .then(data => {
            expect(task.str).toBe('发现本地缓存，优先使用本地缓存模板');
            expect(data.complete).toBeTruthy();
        });
});

test('远程拉取成功', async () => {
    let ctx = {};
    await download('github:yyt/HelloWorld', 'none', {})(ctx, task)
        .then(data => {
            expect(ctx.localTemplatePath).toMatch('.san/templates/HelloWorld');
            expect(data).toEqual({
                next: ['拉取模板ing...'],
                error: '',
                complete: true
            });
        });
});

test('远程拉取失败', async () => {
    let ctx = {};
    await download('', 'none', {})(ctx, task)
        .then(data => {
            expect(data.error).toBe('拉取代码失败，请检查路径和代码权限是否正确');
        });
});
