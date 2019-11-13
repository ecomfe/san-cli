/**
 * @file env test
 */

import {hasYarn, getGitUser} from '../utils/env';
import {execSync} from 'child_process';

jest.mock('child_process');

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
