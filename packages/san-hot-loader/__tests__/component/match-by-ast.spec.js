/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file match by ast test
 * @author tanglei02 (tanglei02@baidu.com)
 */

/* global describe, test */

const matchByAst = require('../../lib/component/match-by-ast');
const parser = require('../../lib/utils/ast-parser');
const groups = require('./mock/component');

describe('测试 Component Match By AST', () => {
    test('测试 defineComponent', () => {
        groups.defineComponents.forEach(code => {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        });
    });

    test('测试 defineComponent 与 connect.san', () => {
        groups.defineComponentWithGlobalSanStoreConnect.forEach(code => {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        });
    });

    test('测试 defineComponent 与 connect.createConnector', () => {
        groups.defineComponentWithInstantSanStoreConnect.forEach(code => {
            let result = matchByAst(code);
            expect(result).toBe(true);
            parser.delete(code);
        });
    });

    test('测试 class Component', () => {
        groups.classComponents.forEach(code => {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        });
    });

    test('测试 class Component 与 connect.san', () => {
        groups.classComponentWithGlobalSanStoreConnect.forEach(code => {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        });
    });

    test('测试 class Component 与 connect.createConnector', () => {
        groups.classComponentWithInstantSanStoreConnect.forEach(code => {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        });
    });

    test('测试 function Component', () => {
        groups.functionComponents.forEach(code => {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        });
    });

    test('测试非 Component', () => {
        groups.noComponent.forEach(code => {
            expect(matchByAst(code)).toBe(false);
            parser.delete(code);
        });
    });
});
