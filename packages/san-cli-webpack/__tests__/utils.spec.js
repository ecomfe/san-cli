/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file utils test
 * @author yanyiting, Lohoyo
 */

const {isJS, isCSS, addDevClientToEntry, resolveEntry, getServerParams, initConfig} = require('../utils');

let port;
beforeAll(async () => {
    const portfinder = require('portfinder');
    port = await portfinder.getPortPromise();
});

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

describe('测试 resolveEntry', () => {
    const cwd = process.cwd();
    const webpackConfig =  {
        entry: {
            index: ['mock']
        },
        resolve: {
            alias: {}
        }
    };
    test('第一个参数为 undefined', () => {
        expect(resolveEntry(
            undefined,
            cwd,
            JSON.parse(JSON.stringify(webpackConfig)),
            cwd + '/packages/san-cli-serve/public/main.js'
        )).toStrictEqual(webpackConfig);
    });
    test('第一个参数有值，第二个参数是目录', () => {
        expect(resolveEntry(
            'mock',
            cwd,
            JSON.parse(JSON.stringify(webpackConfig)),
            cwd + '/packages/san-cli-serve/public/main.js'
        ).resolve.alias['~entry']).toBe(cwd);
    });
    test('第一个参数有值，第二个参数是文件', () => {
        // 随便找个实际存在的 js 文件用于测试
        const absoluteEntryPath = cwd + '/jest.config.js';

        expect(resolveEntry(
            'mock',
            absoluteEntryPath,
            JSON.parse(JSON.stringify(webpackConfig)),
            cwd + '/packages/san-cli-serve/public/main.js'
        ).entry.app).toBe(absoluteEntryPath);
    });
});

describe('测试 getServerParams', () => {
    test('传入预期的输入时输出是否符合预期', async () => {
        const res = await getServerParams({
            port,
            host: '0.0.0.0',
            https: false,
        }, '/');
        expect(res).toEqual({
            https: false,
            port,
            host: '0.0.0.0',
            protocol: 'http',
            publicUrl: null,
            urls: {
                lanUrlForConfig: '172.24.191.21',
                lanUrlForTerminal: `http://172.24.191.21:${port}/`,
                localUrlForTerminal: `http://localhost:${port}/`,
                localUrlForBrowser: `http://localhost:${port}/`
            },
            sockjsUrl: `?http://172.24.191.21:${port}/sockjs-node`,
            networkUrl: `http://172.24.191.21:${port}`
        });
    });
});

describe('测试 initConfig', () => {
    test('传入预期的输入时输出是否符合预期', () => {
        const webpackConfig = {
            mode: 'development',
            output: {
                publicPath: '/'
            },
            plugins: [],
            devServer: {
                hot: true,
                port,
                compress: false,
                contentBase: 'output',
                watchContentBase: false,
                hotOnly: false,
                logLevel: 'silent',
                clientLogLevel: 'silent',
                overlay: {warnings: false, errors: true},
                stats: 'errors-only',
                inline: false,
                lazy: false,
                index: 'index.html',
                watchOptions: {aggregateTimeout: 300, ignored: /node_modules/, poll: 100},
                disableHostCheck: true,
                host: '0.0.0.0',
                https: false,
                before: undefined
            },
            watch: true
        };
        expect(initConfig(webpackConfig)).toStrictEqual({
            config: [webpackConfig],
            isWatch: true,
            watchOptions: undefined,
            devServerConfig: {
                contentBase: 'output',
                watchContentBase: false,
                writeToDisk: expect.any(Function),
                publicPath: '/',
                hot: true,
                port,
                compress: false,
                hotOnly: false,
                logLevel: 'silent',
                clientLogLevel: 'silent',
                overlay: {warnings: false, errors: true},
                stats: 'errors-only',
                inline: false,
                lazy: false,
                index: 'index.html',
                watchOptions: {aggregateTimeout: 300, ignored: /node_modules/, poll: 100},
                disableHostCheck: true,
                host: '0.0.0.0',
                https: false,
                before: undefined
            }
        });
    });
});
