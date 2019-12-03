/**
 * @file downloadRepo test
 * @author yanyiting <yanyiting@baidu.com>
 */

import downloadrepo from '../utils/downloadrepo';

jest.mock('git-clone');

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
        url: 'ssh://yanyiting@icode.baidu.com:8235/baidu/baiduappfeed/itemrep',
        dest: 'aaa',
        checkout: 'master'
    });
});

test('传入icode地址，使用https方式，dev分支', async () => {
    const res = await downloadrepo('icode:baidu/baiduappfeed/itemrep#dev', 'aaa', {
        useHttps: true
    });
    expect(res).toEqual({
        url: 'https://yanyiting@icode.baidu.com/baidu/baiduappfeed/itemrep',
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
