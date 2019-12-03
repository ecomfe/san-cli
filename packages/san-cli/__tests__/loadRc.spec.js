/**
 * @file loadRc test
 * @author yanyiting <yanyiting@baidu.com>
 */

import loadRc from '../lib/loadRc';

test('', () => {
    expect(loadRc(process.cwd() + 'packages/san-cli')).toEqual({
        commands: []
    });
});
