/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @author ksky521
 */

const loader = require('../lib/loader');
const webpackContext = require('./webpack-context.stub');

describe('option-compileTemplate', () => {
    test('compileTemplate = none', () => {
        const source = '<template><span>san@3.9.0支持aPack</span></template>';
        const scope = {
            query: {
                compileTemplate: 'none'
            },
            resourcePath: '/foo.san?lang=html&san=&type=template',
            resourceQuery: '?lang=html&san=&type=template'
        };

        const ctx = webpackContext(scope).runLoader(loader, source);

        expect(ctx.code).toEqual('<span>san@3.9.0支持aPack</span>');
    });

    test('compileTemplate = aPack', () => {
        const source = '<template><span>san@3.9.0支持aPack</span></template>';
        const scope = {
            query: {
                compileTemplate: 'aPack'
            },
            resourcePath: '/foo.san?lang=html&san=&type=template',
            resourceQuery: '?lang=html&san=&type=template'
        };
        const ctx = webpackContext(scope).runLoader(loader, source);
        expect(ctx.code).toEqual([1, 'span', 1, undefined, 3, 'san@3.9.0支持aPack']);
    });

    test('compileTemplate = aPack and Template is empty', () => {
        const source = '<template></template>';
        const scope = {
            query: {
                compileTemplate: 'aPack'
            },
            resourcePath: '/foo.san?lang=html&san=&type=template',
            resourceQuery: '?lang=html&san=&type=template'
        };
        const ctx = webpackContext(scope).runLoader(loader, source);
        expect(ctx.code).toEqual([]);
    });

    test('compileTemplate = aNode', () => {
        const source = '<template><span>san@3.9.0支持aPack</span></template>';
        const scope = {
            query: {
                compileTemplate: 'aNode'
            },
            resourcePath: '/foo.san?lang=html&san=&type=template',
            resourceQuery: '?lang=html&san=&type=template'
        };
        const ctx = webpackContext(scope).runLoader(loader, source);

        expect(ctx.code).toEqual({
            directives: {},
            props: [],
            events: [],
            children: [
                {
                    directives: {},
                    props: [],
                    events: [],
                    children: [{textExpr: {type: 1, value: 'san@3.9.0支持aPack'}}],
                    tagName: 'span'
                }
            ]
        });
    });
    test('优先使用template tag的compileTemplate', () => {
        const source = '<template compileTemplate="aNode"><span>san@3.9.0支持aPack</span></template>';
        const scope = {
            query: {
                compileTemplate: 'aPack'
            },
            resourcePath: '/foo.san?lang=html&san=&type=template&compileTemplate=aNode',
            resourceQuery: '?lang=html&san=&type=template&compileTemplate=aNode'
        };
        const ctx = webpackContext(scope).runLoader(loader, source);
        expect(ctx.code).toEqual({
            directives: {},
            props: [],
            events: [],
            children: [
                {
                    directives: {},
                    props: [],
                    events: [],
                    children: [{textExpr: {type: 1, value: 'san@3.9.0支持aPack'}}],
                    tagName: 'span'
                }
            ]
        });
    });
});
