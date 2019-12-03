/**
 * @file checkStatus test
 * @author yanyiting <yanyiting@baidu.com>
 */

jest.mock('rxjs');
jest.mock('inquirer');

import inquirer from 'inquirer';
import rxjs from 'rxjs';
import checkStatus from '../tasks/checkStatus';

test('新目录，目录未存在', async () => {
    await checkStatus('https://github.com/yyt/HelloWorld.git', 'none', {})({})
        .then(data => {
            expect(data).toEqual({
                next: ['开始检测目标目录状态', '检测离线模板状态'],
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
            next: ['开始检测目标目录状态', '--force 删除目录'],
            error: '',
            complete: false
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
            next: ['开始检测目标目录状态', '检测离线模板状态'],
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
            next: ['开始检测目标目录状态'],
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
            expect(data.next[2]).toMatch('选择覆盖，首先删除');
            expect(data.complete).toBeTruthy();
        });

    // 选择取消
    inquirer.prompt.mockResolvedValueOnce({action: false});
    await checkStatus('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-template', {})({})
        .then(data => {
            expect(data.error).toMatch('取消覆盖');
            expect(data.complete).toBeFalsy();
        });

    // 选择合并
    inquirer.prompt.mockResolvedValueOnce({action: 'merge'});
    await checkStatus('https://github.com/yyt/HelloWorld.git', __dirname + '/mock-template', {})({})
        .then(data => {
            expect(data).toEqual({
                next: ['开始检测目标目录状态', undefined, '检测离线模板状态'],
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
        expect(data.error).toMatch('离线脚手架模板路径不存在');
    });
});
