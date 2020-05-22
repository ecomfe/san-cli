/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @author harttle
 */

const loader = require('../lib/loader');
const webpackContext = require('./webpack-context.stub');

describe('抽取 .san 的内容', () => {
    test('抽取 .san 的 <template> 部分', () => {
        const source = '<template><span>Author: harttle</span></template>';
        const scope = {
            resourcePath: '/foo.san?lang=html&san=&type=template',
            resourceQuery: '?lang=html&san=&type=template'
        };
        const ctx = webpackContext(scope).runLoader(loader, source);
        expect(ctx.code).toEqual('<span>Author: harttle</span>');
    });

    test('抽取 .san 的 <style> 部分', () => {
        const source = '<style>p {color: black}</style>';
        const scope = {
            resourcePath: '/foo.san?lang=css&san=&type=style',
            resourceQuery: '?lang=css&san=&type=style&index=0'
        };
        const ctx = webpackContext(scope).runLoader(loader, source);
        expect(ctx.code).toEqual('p {color: black}');
    });

    test('抽取 .san 的 <script> 部分', () => {
        const source = '<script>console.log(1)</script>';
        const scope = {
            resourcePath: '/foo.san?lang=js&san=&type=script',
            resourceQuery: '?lang=js&san=&type=script&index=0'
        };
        const ctx = webpackContext(scope).runLoader(loader, source);
        expect(ctx.code).toContain('console.log(1)');
    });
});
