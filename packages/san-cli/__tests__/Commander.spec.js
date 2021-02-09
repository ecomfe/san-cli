/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file commander test
 * @author yanyiting
 */

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
    test('commands list', () => {
        // 确认新增命令添加成功
        expect(commands.map(item => item[0].match(/\w+/g)[0])).toEqual([
            'build',
            'serve',
            'init',
            'inspect',
            'command',
            'plugin',
            'remote',
            'ui',
            'hello'
        ]);
    });
    test('run hello', () => {
        // const origLog = console.log;
        global.console = {
            log(msg) {
                expect(msg).toBe('hello, world');
            }
        };
        cli.run(['hello', '--name', 'world']);
    });
});

// test.only('run', () => {
//     cli.run();
// });
