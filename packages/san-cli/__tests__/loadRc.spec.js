/**
 * @file loadRc test
 * @author yanyiting <yanyiting@baidu.com>
 */

jest.mock('read-pkg');

import loadRc from '../lib/loadRc';

test('', () => {
    const commands = loadRc(process.cwd() + '/packages/san-cli').commands;
    let flag = false;
    commands.forEach(item => {
        if (item.indexOf('@baidu/san-cli-command-init') > -1) {
            flag = true;
        }
    });
    expect(flag).toBeTruthy();
});
