/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file downloadRepo test
 * @author yanyiting <yanyiting@baidu.com>
 */

jest.mock('git-clone');

import downloadrepo from '../utils/downloadrepo';
import {getGitUser} from 'san-cli-utils/env';

const {name, isBaidu} = getGitUser();
// 如果是 是百度，则强制使用百度账号
const user = isBaidu ? name : 'git';

test('只传入repoName（默认走github）', async () => {
    const res = await downloadrepo('yyt', 'aaa', {})
    expect(res).toEqual({
        url: 'git@github.com:ksky521/yyt.git',
        dest: 'aaa',
        checkout: 'master'
    });
});

test('传入github地址，使用https方式，dev分支', async () => {
    const res = await downloadrepo('github:yyt/HelloWorld#dev', 'aaa', {
        useHttps: true
    });
    expect(res).toEqual({
        url: 'https://github.com/yyt/HelloWorld.git',
        dest: 'aaa',
        checkout: 'dev'
    });
});

test('传入icode地址', async () => {
    const res = await downloadrepo('icode:baidu/baiduappfeed/itemrep', 'aaa', {});
    expect(res).toEqual({
        url: `ssh://${user}@icode.baidu.com:8235/baidu/baiduappfeed/itemrep`,
        dest: 'aaa',
        checkout: 'master'
    });
});

test('传入icode地址，使用https方式，dev分支', async () => {
    const res = await downloadrepo('icode:baidu/baiduappfeed/itemrep#dev', 'aaa', {
        useHttps: true
    });
    expect(res).toEqual({
        url: `https://${user}@icode.baidu.com/baidu/baiduappfeed/itemrep`,
        dest: 'aaa',
        checkout: 'dev'
    });
});

test('传入coding地址', async () => {
    const res = await downloadrepo('coding:yyt/HelloWorld', 'aaa', {});
    expect(res).toEqual({
        url: 'git@git.coding.net:yyt/HelloWorld.git',
        dest: 'aaa',
        checkout: 'master'
    });
});

test('传入coding地址，使用https方式，dev分支', async () => {
    const res = await downloadrepo('coding:yyt/HelloWorld#dev', 'aaa', {
        useHttps: true
    });
    expect(res).toEqual({
        url: 'https://git.coding.net/yyt/HelloWorld.git',
        dest: 'aaa',
        checkout: 'dev'
    });
});

test('传入错误地址，传空', () => {
    return downloadrepo('', 'aaa', {}).catch(e => {
        expect(e.toString()).toMatch('true');
    });
});

test('传入完整地址git@xxxx', async () => {
    const res = await downloadrepo('git@github.com:ksky521/nodeppt-template-default.git', 'aaa', {});
    expect(res).toEqual({
        url: 'git@github.com:ksky521/nodeppt-template-default.git',
        dest: 'aaa',
        checkout: 'master'
    });
});

test('传入完整地址https://', async () => {
    const res = await downloadrepo('https://git.coding.net/yyt/HelloWorld.git', 'aaa', {});
    expect(res).toEqual({
        url: 'https://git.coding.net/yyt/HelloWorld.git',
        dest: 'aaa',
        checkout: 'master'
    });
});

test('传入完整地址ssh://', async () => {
    const res = await downloadrepo('ssh://yanyiting@icode.baidu.com:8235/baidu/hulk/san-project-base', 'aaa', {});
    expect(res).toEqual({
        url: 'ssh://yanyiting@icode.baidu.com:8235/baidu/hulk/san-project-base',
        dest: 'aaa',
        checkout: 'master'
    });
});
