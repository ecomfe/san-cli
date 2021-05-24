/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file PluginAPI test
 * @author yanyiting, Lohoyo
 */

const PluginAPI = require('../PluginAPI');
const path = require('path');

let pluginAPI = null;
const service = {
    webpackChainFns: [],
    webpackRawConfigFns: [],
    cwd: 'user/yyt',
    pkg: {
        name: 'san-cli'
    },
    projectOptions: {
        outputDir: 'output'
    },
    devServerMiddlewares: []
};
beforeEach(() => {
    process.env.NODE_ENV = 'production';
    pluginAPI = new PluginAPI('plugin-yyt', service);
});

test('测试 isProd', () => {
    expect(pluginAPI.isProd()).toBeTruthy();
});

test('测试 chainWebpack', () => {
    const cb = jest.fn();
    pluginAPI.chainWebpack(cb);
    expect(pluginAPI.service.webpackChainFns.length).toBe(1);
});

test('测试 configWebpack', () => {
    const cb = jest.fn();
    pluginAPI.configWebpack(cb);
    expect(pluginAPI.service.webpackRawConfigFns.length).toBe(1);
});

test('测试 resolve', () => {
    expect(pluginAPI.resolve('index.js')).toMatch(path.resolve('user/yyt/index.js'));
    expect(pluginAPI.resolve()).toBe('user/yyt');
});

test('测试 getServiceInstance', () => {
    expect(pluginAPI.getServiceInstance()).toBe(service);
});

test('测试 getCwd', () => {
    expect(pluginAPI.getCwd()).toBe('user/yyt');
});

test('测试 getPkg', () => {
    expect(pluginAPI.getPkg().name).toBe('san-cli');
});

test('测试 getProjectOption 和 getProjectOptions', () => {
    expect(pluginAPI.getProjectOption().outputDir).toBe('output');
    expect(pluginAPI.getProjectOptions().outputDir).toBe('output');
});

test('测试 middleware', () => {
    expect(pluginAPI.service.devServerMiddlewares.length).toBe(0);
    pluginAPI.middleware(() => {});
    expect(pluginAPI.service.devServerMiddlewares.length).toBe(1);
});
