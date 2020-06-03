/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file customize command
 * @author yanyiting
 */

exports.command = 'hello';
exports.builder = {
    name: {
        type: 'string'
    }
};
exports.description = 'San Command Plugin Demo';
exports.handler = cliApi => {
    console.log(`hello, ${cliApi.name}`);
};
