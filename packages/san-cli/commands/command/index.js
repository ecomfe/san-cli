/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file Add/Manage subcommands
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const path = require('path');
const {textColor} = require('@baidu/san-cli-utils/randomColor');
exports.command = 'command <add|ls|list|rm|remove>';
const desc = 'Add/Manage subcommands';
exports.description = desc;
exports.builder = yargs => {
    if (yargs.argv._.length === 1) {
        const scriptName = yargs.$0;
        console.log(
            textColor(
                `Usage: ${scriptName[0].toUpperCase()}${scriptName.slice(1)} command <add|ls|rm|list|remove> [flags]`
            )
        );
        console.log();
        console.log(desc);
        console.log();

        yargs.showHelp();
        process.exit();
    }

    return yargs.commandDir(path.join(__dirname, './cmds'));
};
exports.handler = argv => {};
