/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file utils test
 * @author yanyiting
 */

const {flatten, tmpl} = require('../utils');
/* global test */
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

describe('测试tmpl', () => {
    test('单个占位符', () => {
        expect(tmpl('My name is {{name}}', {name: 'Jinz'})).toEqual('My name is Jinz');
    });
    test('多个占位符', () => {
        expect(tmpl('My name is {{name}} {{hello}}', {name: 'Jinz', hello: 'Hello JS'}))
            .toEqual('My name is Jinz Hello JS');

        expect(tmpl('My name is {{name}} {{hello}} {{w}}',
            {name: 'Jinz', hello: 'Hello JS'})).toEqual('My name is Jinz Hello JS ');
    });
    test('非法数据', () => {
        expect(tmpl('My name is {{name}}', '')).toEqual('My name is {{name}}');
        expect(tmpl('My name is {{name}}', {})).toEqual('My name is ');
        expect(tmpl(['name'], {name: 'Jinz'})).toEqual(['name']);
    });
});
