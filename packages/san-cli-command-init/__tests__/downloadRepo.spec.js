/**
 * @file downloadRepo test
 */

import downloadrepo from '../utils/downloadrepo';
import {removeSync} from 'fs-extra';

jest.mock('git-clone');
jest.mock('fs-extra');

beforeEach(() => {
    removeSync.mockClear();
});

test('传递正确的地址yyt', () => {
    downloadrepo('yyt', 'aaa');
    expect(removeSync.mock.calls.length).toBe(2);
});

test('传递错误的地址hahaha', () => {
    downloadrepo('hahaha', 'aaa');
    expect(removeSync.mock.calls.length).toBe(1);
});
