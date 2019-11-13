/**
 * @file evaluate test
 */

import evaluate from '../utils/evaluate';

describe('测试evaluate', () => {
    const obj = {
        a: 1,
        b: 2
    };
    test('传入正确', () => {
        expect(evaluate('a', obj)).toBe(1);
    });
    test('传入错误', () => {
        expect(evaluate('c', obj)).toBeFalsy();
    });
});
