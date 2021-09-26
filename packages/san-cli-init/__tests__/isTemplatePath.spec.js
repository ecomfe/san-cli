/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file isTemplatePath test
 * @author jinzhan
 */

const evaluate = require('../utils/isTemplatePath');

/**
 * san init 命令的形式
 * @see https://ecomfe.github.io/san-cli/create-project/
 */

describe('测试san init模板字符串形式', () => {
    test('github简写', () => {
        expect(evaluate('wanwu/san-project')).toBeTruthy();
    });

    test('github完整写法', () => {
        expect(evaluate('https://github.com/wanwu/san-project.git')).toBeTruthy();
    });

    test('SSH的写法', () => {
        expect(evaluate('git@github.com:wanwu/san-project.git')).toBeTruthy();
    });

    test('icode的代码库', () => {
        expect(evaluate('icode:baidu/hulk/san-project-base')).toBeTruthy();
    });

    test('带分支的写法', () => {
        expect(evaluate('template#branch')).toBeTruthy();
    });

    test('单级目录的形式', () => {
        expect(evaluate('dir')).toBeFalsy();
    });

    test('多级目录的形式', () => {
        expect(evaluate('dir/subdir/subdir')).toBeFalsy();
    });
});
