/**
 * @file match by ast test
 * @author clark-t
 */

/* global describe, test */

import matchByAst from '../../lib/component/match-by-ast';
import {hasComment} from '../../lib/utils/ast';
import parser from '../utils/ast-parser';
import * as groups from './mock/component';

describe('测试 Component Match By AST', () => {
    test('测试 defineComponent', () => {
        for (let code of groups.defineComponents) {
            code = parser.parse(code);
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 defineComponent 与 connect.san', () => {
        for (let code of groups.defineComponentWithGlobalSanStoreConnect) {
            code = parser.parse(code);
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 defineComponent 与 connect.createConnector', () => {
        for (let code of groups.defineComponentWithInstantSanStoreConnect) {
            code = parser.parse(code);
            let result = matchByAst(code);
            expect(result).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 class Component', () => {
        for (let code of groups.classComponents) {
            code = parser.parse(code);
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 class Component 与 connect.san', () => {
        for (let code of groups.classComponentWithGlobalSanStoreConnect) {
            code = parser.parse(code);
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 class Component 与 connect.createConnector', () => {
        for (let code of groups.classComponentWithInstantSanStoreConnect) {
            code = parser.parse(code);
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试 function Component', () => {
        for (let code of groups.functionComponents) {
            code = parser.parse(code);
            expect(matchByAst(code)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试非 Component', () => {
        for (let code of groups.noComponent) {
            code = parser.parse(code);
            expect(matchByAst(code)).toBe(false);
            parser.delete(code);
        }
    });

    test('测试加san-hmr components注释的component', () => {
        let comment = 'san-hmr components';
        for (let code of groups.hasCommentComponent) {
            code = parser.parse(code);
            expect(hasComment(code, comment)).toBe(true);
            parser.delete(code);
        }
    });

    test('测试加san-hmr disable注释的component', () => {
        let comment = 'san-hmr disable';
        for (let code of groups.hasCommentDisable) {
            code = parser.parse(code);
            expect(hasComment(code, comment)).toBe(true);
            parser.delete(code);
        }
    });
});

