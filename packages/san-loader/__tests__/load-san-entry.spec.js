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

describe('.san 文件的产出', () => {
    test('import <template> 部分', () => {
        const source = '<template><span>Author: harttle</span></template>';
        const ctx = webpackContext({resourcePath: '/foo.san'}).runLoader(loader, source);
        expect(ctx.code).toContain('import template from \'/foo.san?lang=html&san=&type=template');
    });

    test('import <style> 部分', () => {
        const source = '<style>p {color: black}</style>';
        const ctx = webpackContext({resourcePath: '/foo.san'}).runLoader(loader, source);
        expect(ctx.code).toContain('import \'/foo.san?lang=css&san=&type=style&index=0');
    });

    test('import <script> 部分', () => {
        const source = '<script>console.log(1)</style>';
        const ctx = webpackContext({resourcePath: '/foo.san'}).runLoader(loader, source);
        expect(ctx.code).toContain('import script from \'/foo.san?lang=js&san=&type=script');
        expect(ctx.code).toContain('export * from \'/foo.san?lang=js&san=&type=script');
    });
});
