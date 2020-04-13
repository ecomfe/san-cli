/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file evaluate test
 * @author yanyiting <yanyiting@baidu.com>
 */

import evaluate from '../utils/evaluate';

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
