/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file utils test
 * @author yanyiting <yanyiting@baidu.com>
 */

import {
    flatten
} from '../utils';

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
