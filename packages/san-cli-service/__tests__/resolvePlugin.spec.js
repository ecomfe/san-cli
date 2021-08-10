/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file resolvePlugin.js test
 * @author Lohoyo
 */

const resolvePlugin = require('../resolvePlugin');

test('本地不存在对应的插件', () => {
    expect(() => resolvePlugin('plugin')).toThrow('`plugin` not found!');
});

test('没有传入文件的路径而是传入了文件夹的路径', () => {
    expect(() => resolvePlugin('packages')).toThrow('`packages` not found!');
});
