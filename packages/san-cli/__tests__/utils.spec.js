/**
 * @file utils单测
 */

import {
    isLocalPath,
    resolveLocal,
    getAssetPath,
    getTemplatePath,
    evaluate,
    hasYarn,
    getGitUser,
    findExisting,
    flatten,
    isJS,
    isCSS,
    prepareUrls,
    addDevClientToEntry
} from '../lib/utils';

import {execSync} from 'child_process';

jest.mock('child_process');
jest.mock('fs-extra');
jest.mock('chalk');

describe('测试isLocalPath', () => {
    test('本地绝对路径', () => {
        expect(isLocalPath('/Users/Desktop/yyt')).toBeTruthy();
    });
    test('本地相对路径', () => {
        expect(isLocalPath('../yyt')).toBeTruthy();
    });
    test('windows系统本地路径', () => {
        expect(isLocalPath('E:\yyt')).toBeTruthy();
    });
    test('远程代码仓库地址', () => {
        expect(isLocalPath('https://github.com/yyt/HelloWorld.git')).toBeFalsy();
    });
});

describe('测试resolveLocal', () => {
    // jest.mock('path');
    test('传入一个参数', () => {
        expect(resolveLocal('node_modules'))
            .toMatch('/san-cli/packages/san-cli/node_modules');
    });
    test('传入两个参数', () => {
        expect(resolveLocal('node_modules', 'yyt'))
            .toMatch('/san-cli/packages/san-cli/node_modules/yyt');
    });
});

describe('测试getAssetPath', () => {
    test('传入静态目录和静态文件名', () => {
        expect(getAssetPath('static/estar', 'yyt.js')).toBe('static/estar/yyt.js');
    });
    test('仅传入静态文件名', () => {
        expect(getAssetPath('', 'yyt.js')).toBe('yyt.js');
    });
});

describe('测试getTemplatePath', () => {
    test('传入绝对地址', () => {
        expect(getTemplatePath('/User/yyt/aaa')).toBe('/User/yyt/aaa');
    });
    test('传入相对地址', () => {
        expect(getTemplatePath('../yyt')).toMatch('/yyt');
    });
});

describe('测试evaluate', () => {
    const obj = {
        a: 1,
        b: 2
    };
    test('传入正确', () => {
        expect(evaluate('a', obj)).toBe(1);
    });
    test('传入错误', () => {
        expect(evaluate('c', obj)).toBeFalsy();
    });
});

describe('测试hasYarn', () => {
    test('测试execSync调用次数是否正确', () => {
        hasYarn();
        expect(execSync.mock.calls.length).toBe(1);
        hasYarn();
        expect(execSync.mock.calls.length).toBe(1);
    });
});

describe('测试getGitUser', () => {
    test('测试非百度邮箱输出结果', () => {
        expect(getGitUser()).toEqual({
            name: 'yyt',
            email: 'yyt@123.com',
            author: 'yyt <yyt@123.com>',
            isBaidu: false
        });
    });
});

describe('测试findExisting', () => {
    test('', () => {
        expect(findExisting('User/yyt/wiki', ['a/b', 'b']))
            .toBe('User/yyt/wiki/a/b');
    });
});

describe('测试flatten', () => {
    test('空数组', () => {
         expect(flatten([])).toEqual([]);
    });
    test('一维数组', () => {
        expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
    });
    test('二维数组', () => {
        expect(flatten([[1, 2, 3], 4, 5, 6, []])).toEqual([1, 2, 3, 4, 5, 6]);
    });
});

describe('测试isJS', () => {
    test('.js文件', () => {
        expect(isJS('yyt.js')).toBeTruthy();
    });
    test('.css文件', () => {
        expect(isJS('yyt.css')).toBeFalsy();
    });
});

describe('测试isCSS', () => {
    test('.css文件', () => {
        expect(isCSS('yyt.css')).toBeTruthy();
    });
    test('.js文件', () => {
        expect(isCSS('yyt.js')).toBeFalsy();
    });
});

describe('测试prepareUrls', () => {
    test('本地地址', () => {
        expect(prepareUrls('http', '0.0.0.0', 9000,)).toEqual({
            lanUrlForConfig: '172.24.191.21',
            lanUrlForTerminal: 'http://172.24.191.21:9000/',
            localUrlForTerminal: 'http://localhost:9000/',
            localUrlForBrowser: 'http://localhost:9000/'
        });
    });
    test('非本地地址', () => {
        expect(prepareUrls('http', '123.3.3.3', 8001, '/yyt')).toEqual({
            lanUrlForConfig: undefined,
            lanUrlForTerminal: 'unavailable',
            localUrlForTerminal: 'http://123.3.3.3:8001/yyt',
            localUrlForBrowser: 'http://123.3.3.3:8001/yyt'
        });
    });
});

describe('测试addDevClientToEntry', () => {
    test('entry为Object', () => {
        let config = {
            entry: {
                yyt: 'yyt/index.js',
                haha: 'haha/index.js'
            }
        };
        addDevClientToEntry(config, ['webpack-dev-server/client']);
        expect(config.entry).toEqual({
            yyt: ['webpack-dev-server/client', 'yyt/index.js'],
            haha: ['webpack-dev-server/client', 'haha/index.js']
        });
    });
    test('entry为Array', () => {
        let config = {
            entry: [
                'yyt/index.js',
                'haha/index.js'
            ]
        };
        addDevClientToEntry(config, ['webpack-dev-server/client']);
        expect(config.entry).toEqual([
            'webpack-dev-server/client',
            'yyt/index.js',
            'haha/index.js'
        ]);
    });
    test('entry为function', () => {
        let config = {
            entry: devClient => ({
                yyt: devClient.concat(['yyt/index.js'])
            })
        };
        addDevClientToEntry(config, ['webpack-dev-server/client']);
        expect(config.entry).toEqual({
            yyt: ['webpack-dev-server/client', 'yyt/index.js']
        });
    });
});
