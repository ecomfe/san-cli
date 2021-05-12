/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file PluginAPI test
 * @author yanyiting
 */

const PluginAPI = require('../PluginAPI');
const path = require('path');

let pluginApi = null;
beforeEach(() => {
    process.env.NODE_ENV = 'production';
    pluginApi = new PluginAPI('plugin-yyt', {
        webpackChainFns: [],
        webpackRawConfigFns: [],
        cwd: 'user/yyt'
    });
});

test('测试isProd', () => {
    expect(pluginApi.isProd()).toBeTruthy();
});

test('测试chainWebpack', () => {
    const cb = jest.fn();
    pluginApi.chainWebpack(cb);
    expect(pluginApi.service.webpackChainFns.length).toBe(1);
});

test('测试configWebpack', () => {
    const cb = jest.fn();
    pluginApi.configWebpack(cb);
    expect(pluginApi.service.webpackRawConfigFns.length).toBe(1);
});

test('测试resolve', () => {
    expect(pluginApi.resolve('index.js')).toMatch(path.resolve('user/yyt/index.js'));
});
