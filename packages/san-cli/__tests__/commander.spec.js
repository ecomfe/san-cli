/**
 * @file commander test
 * @author yanyiting <yanyiting@baidu.com>
 */

jest.mock('read-pkg');

import Command from '../lib/commander';

test('loadRc', () => {
    const commands = new Command().loadRc(process.cwd() + '/packages').commands;
    let flag = false;
    commands.forEach(item => {
        if (item.indexOf('@baidu/san-cli-command-init') > -1) {
            flag = true;
        }
    });
    expect(flag).toBeFalsy();
});
