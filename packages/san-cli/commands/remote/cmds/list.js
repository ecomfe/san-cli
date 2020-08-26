/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file list
 * @author ksky521
 */

module.exports = {
    command: 'list',
    desc: 'List all scaffolding addresses',
    aliases: ['ls'],
    builder: {},
    handler(argv) {
        const readRc = require('san-cli-utils/readRc');
        const {log} = require('san-cli-utils/ttyLogger');
        // 检测是否存在
        // 全局
        let sanrc = readRc('rc') || {};
        const templateAlias = sanrc.templateAlias;
        const templateAliasKeys = templateAlias ? Object.keys(templateAlias) : [];

        // ask 替换？
        templateAliasKeys.forEach(key => {
            log(`${key}  ${templateAlias[key]}`);
        });

        if (!templateAliasKeys.length) {
            log('List is empty.');
        }
    }
};
