/**
 * @file store match by ast test
 * @author tanglei02 (tanglei02@baidu.com)
 */

import matchByAst from '../../lib/store/match-by-ast';
import parser from '../../lib/utils/ast-parser';
import * as groups from './mock/store';

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

