/**
 * @file commander test
 * @author yanyiting <yanyiting@baidu.com>
 */

jest.mock('read-pkg');

import Command from '../lib/Commander';

const cli = new Command();

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
        'docit',
        'inspect',
        'command',
        'plugin',
        'remote',
        'hello'
    ]);
});

// test.only('run', () => {
//     cli.run();
// });
