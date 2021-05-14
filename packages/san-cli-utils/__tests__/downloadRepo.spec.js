/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file downloadRepo test
 * @author yanyiting
 */

jest.mock('git-clone');

const downloadrepo = require('../downloadRepo');
const {getGitUser} = require('../env');

const {name, isBaidu} = getGitUser();
// 如果是 是百度，则强制使用百度账号
const user = isBaidu ? name : 'git';

test('只传入repoName（默认走github），使用ssh方式', async () => {
    const res = await downloadrepo('yyt', 'aaa', {
        ssh: true
    });
    expect(res).toEqual({
        url: 'git@github.com:ksky521/yyt.git',
        dest: 'aaa',
        checkout: ''
    });
});

test('传入github地址，使用https方式，dev分支', async () => {
    const res = await downloadrepo('github:yyt/HelloWorld#dev', 'aaa', {});
    expect(res).toEqual({
        url: 'https://github.com/yyt/HelloWorld.git',
        dest: 'aaa',
        checkout: 'dev'
    });
});

test('传入icode地址，使用ssh方式', async () => {
    const res = await downloadrepo('icode:baidu/foo/bar', 'aaa', {
        ssh: true
    });
    expect(res).toEqual({
        url: `ssh://${user}@icode.baidu.com:8235/baidu/foo/bar`,
        dest: 'aaa',
        checkout: ''
    });
});

test('传入icode地址，使用https方式，dev分支', async () => {
    const res = await downloadrepo('icode:baidu/foo/bar#dev', 'aaa', {});
    expect(res).toEqual({
        url: `https://${user}@icode.baidu.com/baidu/foo/bar`,
        dest: 'aaa',
        checkout: 'dev'
    });
});

test('传入coding地址，使用ssh方式', async () => {
    const res = await downloadrepo('coding:yyt/HelloWorld', 'aaa', {
        ssh: true
    });
    expect(res).toEqual({
        url: 'git@git.coding.net:yyt/HelloWorld.git',
        dest: 'aaa',
        checkout: ''
    });
});

test('传入coding地址，使用https方式，dev分支', async () => {
    const res = await downloadrepo('coding:yyt/HelloWorld#dev', 'aaa', {});
    expect(res).toEqual({
        url: 'https://git.coding.net/yyt/HelloWorld.git',
        dest: 'aaa',
        checkout: 'dev'
    });
});

test('传入错误地址，传空', () => {
    return downloadrepo('', 'aaa', {}).catch(e => {
        expect(e.toString()).toEqual(expect.stringMatching(/please check the path/));


    });
});

test('传入完整地址git@xxxx', async () => {
    const res = await downloadrepo('git@github.com:ksky521/nodeppt-template-default.git', 'aaa', {});
    expect(res).toEqual({
        url: 'git@github.com:ksky521/nodeppt-template-default.git',
        dest: 'aaa',
        checkout: ''
    });
});

test('传入完整地址https://', async () => {
    const res = await downloadrepo('https://git.coding.net/yyt/HelloWorld.git', 'aaa', {});
    expect(res).toEqual({
        url: 'https://git.coding.net/yyt/HelloWorld.git',
        dest: 'aaa',
        checkout: ''
    });
});

test('传入完整地址ssh://', async () => {
    const res = await downloadrepo('ssh://yanyiting@icode.baidu.com:8235/baidu/foo/bar', 'aaa', {});
    expect(res).toEqual({
        url: 'ssh://yanyiting@icode.baidu.com:8235/baidu/foo/bar',
        dest: 'aaa',
        checkout: ''
    });
});
