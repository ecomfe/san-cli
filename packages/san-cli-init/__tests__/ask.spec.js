/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file ask.js test
 * @author Lohoyo
 */

const ask = require('../ask');

test('通过 cli 的 flag 传入 key 值', async () => {
    const answers = await ask({
        name: {
            type: 'string',
            required: true,
            label: '项目名称',
            default: '{{name}}'
        }
    }, {}, {name: 'hahaha'});
    expect(answers).toStrictEqual({name: 'hahaha'});
});
