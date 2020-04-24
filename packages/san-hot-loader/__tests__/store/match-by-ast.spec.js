/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file store match by ast test
 * @author tanglei02 (tanglei02@baidu.com)
 */

/* global describe, test */

const matchByAst = require('../../lib/store/match-by-ast');
const parser = require('../../lib/utils/ast-parser');
const groups = require('./mock/store');

describe('测试 Store Match By AST', () => {
    test('测试 store.addAction', () => {
        for (let code of groups.globalActions) {
            expect(matchByAst(code)).not.toBe(undefined);
            parser.delete(code);
        }
    });

    test('测试非 store.addAction', () => {
        for (let code of groups.noGlobalActions) {
            let result = matchByAst(code);
            expect(result).toBe(undefined);
            parser.delete(code);
        }
    });
    test('测试 new Store({})', () => {
        for (let code of groups.instantStores) {
            expect(matchByAst(code)).not.toBe(undefined);
            parser.delete(code);
        }
    });
    test('测试非 new Store({})', () => {
        for (let code of groups.noInstantStores) {
            expect(matchByAst(code)).toBe(undefined);
            parser.delete(code);
        }
    });
});

