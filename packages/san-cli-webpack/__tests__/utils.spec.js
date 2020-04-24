/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file utils test
 * @author yanyiting <yanyiting@baidu.com>
 */

const {isJS, isCSS, addDevClientToEntry} = require('../utils');

describe('测试isJS', () => {
    test('.js文件', () => {
        expect(isJS('yyt.js')).toBeTruthy();
    });
    test('.css文件', () => {
        expect(isJS('yyt.css')).toBeFalsy();
    });
});

describe('测试isCSS', () => {
    test('.css文件', () => {
        expect(isCSS('yyt.css')).toBeTruthy();
    });
    test('.js文件', () => {
        expect(isCSS('yyt.js')).toBeFalsy();
    });
});

describe('测试addDevClientToEntry', () => {
    test('entry为Object', () => {
        let config = {
            entry: {
                yyt: 'yyt/index.js',
                haha: 'haha/index.js'
            }
        };
        addDevClientToEntry(config, ['webpack-dev-server/client']);
        expect(config.entry).toEqual({
            yyt: ['webpack-dev-server/client', 'yyt/index.js'],
            haha: ['webpack-dev-server/client', 'haha/index.js']
        });
    });
    test('entry为Array', () => {
        let config = {
            entry: ['yyt/index.js', 'haha/index.js']
        };
        addDevClientToEntry(config, ['webpack-dev-server/client']);
        expect(config.entry).toEqual(['webpack-dev-server/client', 'yyt/index.js', 'haha/index.js']);
    });
    test('entry为function', () => {
        let config = {
            entry: devClient => ({
                yyt: devClient.concat(['yyt/index.js'])
            })
        };
        addDevClientToEntry(config, ['webpack-dev-server/client']);
        expect(config.entry).toEqual({
            yyt: ['webpack-dev-server/client', 'yyt/index.js']
        });
    });
});
