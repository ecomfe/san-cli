/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file add command
 * @author ksky521
 */

const path = require('path');
const {textCommonColor} = require('san-cli-utils/color');
exports.command = 'remote <add|ls|list|rm|remove>';
const desc = 'Add/Manage scaffolding address';
exports.description = desc;
exports.builder = yargs => {
    if (yargs.argv._.length === 1) {
        const scriptName = yargs.$0;
        /* eslint-disable no-console */
        console.log(
            textCommonColor(
                `Usage: ${scriptName[0].toUpperCase()}${scriptName.slice(
                    1
                )} remote <add|ls|rm|list|remove>`
            )
        );
        console.log();
        console.log(desc);
        console.log();
        /* eslint-enable no-console */
        yargs.showHelp();
        process.exit();
    }
    return yargs.commandDir(path.join(__dirname, './cmds'));
};
exports.handler = argv => {};
