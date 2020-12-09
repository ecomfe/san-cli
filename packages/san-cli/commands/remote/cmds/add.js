/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file add
 * @author ksky521
 */

module.exports = {
    command: 'add <name> <url>',
    desc: 'Add a scaffolding address',
    builder: {},
    async handler(argv) {
        const fse = require('fs-extra');
        const inquirer = require('inquirer');
        const readRc = require('san-cli-utils/readRc');
        const {getGlobalSanRcFilePath, getUserHomeFolder} = require('san-cli-utils/path');
        const {success} = require('san-cli-utils/ttyLogger');
        const {name, url} = argv;

        // 检测是否存在
        // 全局
        let sanrc = readRc('rc') || {};
        const templateAlias = sanrc.templateAlias || {};
        if (templateAlias[name] && templateAlias[name] !== url) {
            // ask 替换？

            const answers = await inquirer.prompt([
                {
                    name: 'action',
                    type: 'list',
                    // eslint-disable-next-line
                    message: `\`${name}\` already exists，and the current value is \`${templateAlias[name]}\`.Please select an operation：`,
                    choices: [
                        {name: 'overwrite', value: 'overwrite'},
                        {name: 'cancel', value: false}
                    ]
                }
            ]);
            if (answers.action === false) {
                process.exit(1);
            }
        }
        templateAlias[name] = url;
        sanrc.templateAlias = templateAlias;
        let filepath = getGlobalSanRcFilePath();
        let homeFolder = getUserHomeFolder();
        let desiredMode = 0o2775;
        fse.ensureDirSync(homeFolder, desiredMode);
        fse.writeJsonSync(filepath, sanrc);

        success(`Add \`${name}\` success!`);
    }
};
