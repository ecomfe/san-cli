/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file path test
 * @author yanyiting
 */

const {
    isLocalPath,
    getAssetPath,
    getTemplatePath,
    findExisting,
    prepareUrls
} = require('../path');
const path = require('path');

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

describe('测试findExisting', () => {
    test('', () => {
        expect(findExisting(['scripts', 'test.js'], process.cwd()))
            .toMatch(path.join(process.cwd(), 'scripts'));
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
