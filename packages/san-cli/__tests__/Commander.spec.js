/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file commander test
 * @author yanyiting <yanyiting@baidu.com>
 */

jest.mock('read-pkg');

const Commander = require('../lib/Commander');

const cli = new Commander();

test('command init', () => {
    const {presets, _commands} = cli;
    // 确认 loadRc 执行成功
    let flag = false;
    presets.commands.forEach(item => {
        if (item.indexOf('__tests__/mock/san-command.js') > -1) {
            flag = true;
        }
    });
    expect(flag).toBeTruthy();

    // 确认新增命令添加成功
    expect(_commands.map(item => item[0].match(/\w+/g)[0])).toEqual([
        'build',
        'serve',
        'init',
        'inspect',
        'command',
        'plugin',
        'remote',
        'docit',
        'hello'
    ]);
});

// test.only('run', () => {
//     cli.run();
// });
