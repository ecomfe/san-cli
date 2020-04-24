/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file env test
 * @author yanyiting <yanyiting@baidu.com>
 */

const {hasYarn, getGitUser} = require('../env');
const {execSync} = require('child_process');

jest.mock('child_process');

beforeEach(() => {
    execSync.mockClear();
});

describe('测试hasYarn', () => {
    test('测试execSync调用次数是否正确', () => {
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
