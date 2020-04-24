/**
 * @file store match by ast test
 * @author tanglei02 (tanglei02@baidu.com)
 */

/* global describe, test */

import matchByAst from '../../lib/store/match-by-ast';
import parser from '../utils/ast-parser';
import * as groups from './mock/store';

describe('测试 Store Match By AST', () => {
    test('测试 store.addAction', () => {
        for (let code of groups.globalActions) {
            code = parser.parse(code);
            expect(matchByAst(code)).not.toBe(undefined);
            parser.delete(code);

        }
    });

    test('测试非 store.addAction', () => {
        for (let code of groups.noGlobalActions) {
            code = parser.parse(code);
            let result = matchByAst(code);
            expect(result).toBe(false);
            parser.delete(code);
        }
    });
    test('测试 new Store({})', () => {
        for (let code of groups.instantStores) {
            code = parser.parse(code);
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });
    test('测试非 new Store({})', () => {
        for (let code of groups.noInstantStores) {
            code = parser.parse(code);
            expect(matchByAst(code)).toBe(false);
            parser.delete(code);
        }
    });
});
