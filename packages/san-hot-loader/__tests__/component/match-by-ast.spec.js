/**
 * @file match by ast test
 * @author tanglei02 (tanglei02@baidu.com)
 */

/* global describe, test */

import matchByAst from '../../lib/component/match-by-ast';
import parser from '../../lib/utils/ast-parser';
import * as groups from './mock/component';

describe('测试 Component Match By AST', () => {
    test('测试 defineComponent', () => {
        for (let code of groups.defineComponents) {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 defineComponent 与 connect.san', () => {
        for (let code of groups.defineComponentWithGlobalSanStoreConnect) {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 defineComponent 与 connect.createConnector', () => {
        for (let code of groups.defineComponentWithInstantSanStoreConnect) {
            let result = matchByAst(code);
            expect(result).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 class Component', () => {
        for (let code of groups.classComponents) {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 class Component 与 connect.san', () => {
        for (let code of groups.classComponentWithGlobalSanStoreConnect) {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 class Component 与 connect.createConnector', () => {
        for (let code of groups.classComponentWithInstantSanStoreConnect) {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 function Component', () => {
        for (let code of groups.functionComponents) {
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试非 Component', () => {
        for (let code of groups.noComponent) {
            expect(matchByAst(code)).toBe(false);
            parser.delete(code);
        }
    });
});

