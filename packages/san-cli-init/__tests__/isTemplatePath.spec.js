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

// * 1. 支持传入完整repo地址:
// * san init ksky521/san-project demo
// * # 下面的示例请换成自己的地址和 username
// * san init https://github.com/ksky521/san-project.git demo
// * # 下面的示例请换成自己的地址和 username (百度内部建议使用如下模板地址)
// * san init ssh://${username}@icode.baidu.com:8235/baidu/hulk/san-project-base demo
// *
// * 2. 默认是从 github repo 安装
// *  # 所以 git@github.com:ksky521/simple.git 这个 repo到 demo 文件，可以使用：
// *  san init simple demo
// *
// * 3. 支持 github，icode，gitlab 等简写方式
// * san init github:ksky521/san-project demo
// * san init icode:baidu/hulk/san-project-base demo
// * san init coding:ksky521/san-project demo
// *
// * 4. 分支写法
// * san init template#branch demo
// *
// * 5. 项目生成在当前目录
// * san init template#branch .

describe('测试san init模板字符串形式', () => {
    test('github简写', () => {
        expect(evaluate('ksky521/san-project')).toBeTruthy();
    });

    test('github完整写法', () => {
        expect(evaluate('https://github.com/ksky521/san-project.git')).toBeTruthy();
    });

    test('SSH的写法', () => {
        expect(evaluate('git@github.com:ksky521/simple.git')).toBeTruthy();
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
