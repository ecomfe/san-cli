/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file list
 * @author wangyongqing <wangyongqing01@baidu.com>
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
        if (templateAlias) {
            // ask 替换？
            Object.keys(templateAlias).forEach(key => {
                log(`${key}  ${templateAlias[key]}`);
            });
        } else {
            log('List is empty.');
        }
    }
};
