/**
 * @file downloadrepo单测
 */

import loadRc from '../lib/loadRc';

jest.mock('cosmiconfig');

test('', () => {
    expect(loadRc()).toEqual({
        a: 1,
        b: 2
    });
    expect(loadRc()).toEqual({});
});
