/**
 * @file utils单测
 * @author yanyiting <yanyiting@baidu.com>
 */

import {isLocalPath} from '../lib/utils';

describe('测试isLocalPath', () => {
    test('本地绝对路径', () => {
        expect(isLocalPath('/Users/Desktop/yyt')).toBeTruthy();
    });
    test('本地相对路径', () => {
        expect(isLocalPath('../yyt')).toBeTruthy();
    });
    test('windows系统本地路径', () => {
        expect(isLocalPath('E:\yyt')).toBeTruthy();
    });
    test('远程代码仓库地址', () => {
        expect(isLocalPath('https://github.com/yyt/HelloWorld.git')).toBeFalsy();
    });
});

describe('测试resolveLocal', () => {

});
