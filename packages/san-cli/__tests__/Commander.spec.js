/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file commander test
 * @author yanyiting
 */
/* global describe, jest, test */

jest.mock('read-pkg');

const Commander = require('../lib/Commander');

describe('Commander', () => {
    const cli = new Commander();
    const {presets, _commands: commands} = cli;
    test('presets', () => {
        // 确认 loadRc 执行成功
        let flag = false;
        presets.commands.forEach(item => {
            if (item.indexOf('__tests__/mock/san-command.js') > -1) {
                flag = true;
            }
        });
        expect(flag).toBeTruthy();
    });

    // 确认新增命令添加成功
    test('commands list', () => {
        // 用户可能有自定义的命令，这里不能直接toEqual
        const commandsList = commands.map(item => item[0].match(/\w+/g)[0]);
        expect(commandsList).toEqual(expect.arrayContaining([
            'build',
            'serve',
            'init',
            'inspect',
            'command',
            'plugin',
            'remote',
            'ui',
            'customize_cmd'
        ]));
    });
    test('run customize_cmd', () => {
        const val = 'hello, world';
        global.console = {
            log(msg) {
                expect(msg).toBe(val);
            }
        };
        cli.run(['customize_cmd', '--name', val]);
    });
});

// test.only('run', () => {
//     cli.run();
// });
