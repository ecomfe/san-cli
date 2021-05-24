/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file utils.js test
 * @author Lohoyo
 */

const {defineVar, ensureRelative, normalizeProjectOptions, resolveLocal} = require('../utils');

describe('测试 defineVar 函数', () => {
    test('有 SAN_VAR_ 开头的环境变量的情况', () => {
        process.env.SAN_VAR_TEST = 1;
        const vars = defineVar({publicPath: 'https://s.bdstatic.com/'}, true);
        expect(vars.TEST).toBe('1');
        delete process.env.SAN_VAR_TEST;
    });
});

describe('测试 ensureRelative 函数', () => {
    test('第二个参数传入了绝对路径', () => {
        const path = ensureRelative('/Users/Lohoyo', '/Users/Lohoyo/index.html');
        expect(path).toBe('index.html');
    });
});

describe('测试 normalizeProjectOptions 函数', () => {
    test('没传参数', () => {
        expect(normalizeProjectOptions()).toEqual({});
    });
    test('调用返回结果的 resolve 函数', () => {
        expect(normalizeProjectOptions({
            context: '/Users/Lohoyo/san-project'
        }).resolve()).toEqual('/Users/Lohoyo/san-project');
    });
});

describe('测试 resolveLocal 函数', () => {
    test('传入正确的参数是否返回了正确的结果', () => {
        expect(resolveLocal('node_modules')).toBe(process.cwd() + '/packages/san-cli-config-webpack/node_modules');
    });
});
