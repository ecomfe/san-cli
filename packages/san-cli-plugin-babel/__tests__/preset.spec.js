/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file preset test
 * @author yanyiting
 */

const preset = require('../preset');
const babel = require('@babel/core');

const defaultOptions = {
    presets: preset().presets,
    filename: 'test-entry-file.js'
};

test('默认值', () => {
    const presets = preset().presets;
    expect(presets[0][1]).toEqual({
        debug: false,
        loose: false,
        ignoreBrowserslistConfig: undefined,
        useBuiltIns: 'usage',
        corejs: 3,
        targets: undefined,
        modules: false
    });
});

test('添加 plugin', () => {
    const plugins = preset({plugins: [{id: 'a'}]}).plugins;
    expect(plugins.length).toBe(7);
});

test('检测 polyfill', () => {
    const {code} = babel.transformSync(`
        const a = new Map();
    `, defaultOptions);
    expect(code).toMatch('"core-js/modules/es.array.iterator"');
    expect(code).toMatch('"core-js/modules/es.map"');
    expect(code).toMatch('"core-js/modules/es.object.to-string"');
    expect(code).toMatch('"core-js/modules/es.string.iterator"');
    expect(code).toMatch('"core-js/modules/web.dom-collections.iterator"');
    expect(code).toMatch('var a = new Map()');
});

test('modern 模式会省略不必要的 polyfill', () => {
    const {code} = babel.transformSync(`
        const a = new Map();
    `, {
        presets: preset({}, {targets: {esmodules: true}}).presets,
        filename: 'test-entry-file.js'
    });
    expect(code).not.toMatch('"core-js/modules/es.map"');
    expect(code).not.toMatch('"core-js/modules/es.object.to-string"');
    expect(code).not.toMatch('"core-js/modules/es.string.iterator"');
});

test('解构赋值', () => {
    const {code} = babel.transformSync(`
        const a = {...b};
    `, defaultOptions);
    expect(code).toMatch('var a = _objectSpread({}, b)');
});

test('async/await', () => {
    const {code} = babel.transformSync(`
        async function hello() {
            await Promise.resolve();
        }
    `, defaultOptions);
    expect(code).toMatch('"regenerator-runtime/runtime"');
});
