/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file remove
 * @author ksky521
 */

module.exports = {
    command: 'remove <name>',
    desc: 'Remove a scaffolding address',
    aliases: ['rm'],
    builder: {},
    async handler(argv) {
        const fse = require('fs-extra');
        const prompts = require('prompts');
        const readRc = require('san-cli-utils/readRc');
        const {getGlobalSanRcFilePath} = require('san-cli-utils/path');
        const {success} = require('san-cli-utils/ttyLogger');
        const {name} = argv;

        // 检测是否存在
        // 全局
        let sanrc = readRc('rc') || {};
        const templateAlias = sanrc.templateAlias;
        if (templateAlias && templateAlias[name]) {
            // ask 替换？

            const answers = await prompts([
                {
                    name: 'action',
                    type: 'confirm',
                    message: `Are you sure to remove \`${name}\`?`
                }
            ]);
            if (answers.action === false) {
                process.exit(1);
            }
            sanrc.templateAlias[name] = undefined;
            delete sanrc.templateAlias[name];
            let filepath = getGlobalSanRcFilePath();
            fse.writeJsonSync(filepath, sanrc);

            success(`Remove \`${name}\` success!`);
        }
    }
};
