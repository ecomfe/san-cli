/**
 * @file PluginAPI test
 */

import PluginAPI from '../lib/PluginAPI';

let pluginApi = null;
beforeEach(() => {
    pluginApi = new PluginAPI('plugin-yyt', {
        mode: 'production',
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

test('测试configureWebpack', () => {
    const cb = jest.fn();
    pluginApi.configureWebpack(cb);
    expect(pluginApi.service.webpackRawConfigFns.length).toBe(1);
});

test('测试resolve', () => {
    expect(pluginApi.resolve('index.js')).toMatch('user/yyt/index.js');
});
