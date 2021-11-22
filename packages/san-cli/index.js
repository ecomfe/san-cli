#!/usr/bin/env node

/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file bin 文件入口
 * @author ksky521
 */

/* eslint-disable no-console */
const updateNotifier = require('update-notifier');
const semver = require('semver');
const chalk = require('chalk');

const {
    scriptName,
    engines: {node: requiredNodeVersion},
    name: pkgName,
    version: pkgVersion
} = require('./package.json');

// 1. set process
setProcess(scriptName);
// 2. 检测 node 版本
checkNodeVersion(requiredNodeVersion, pkgName);
// 3. 执行命令
execCommand();

function execCommand() {
    const cmdName = process.argv[2];
    if (['-v', '-V', '--version'].includes(cmdName)) {
        console.log(pkgVersion);
        return;
    }
    if (['-h', '--help'].includes(cmdName)) {
        console.log(`For more information, visit ${chalk.cyan('https://ecomfe.github.io/san-cli')}`);
        return;
    }
    if (!cmdName || cmdName.startsWith('-')) {
        console.error(
            `No command is given, you can install any ${chalk.cyan('san-cli-*')} package to install a command`
        );
        return;
    }
    try {
        // load command
        const subCommands = [`san-cli-${cmdName}`, `@baidu/san-cli-${cmdName}`];
        for (let i = 0, len = subCommands.length; i < len; i++) {
            const subPkgName = subCommands[i];
            const command = require(subPkgName);
            if (command && command.command) {
                const {name, version} = require(`${subPkgName}/package.json`);
                console.log(`${pkgName}@${pkgVersion}/${name}@${version}`);
                // 检查子模块更新情况
                upNotifier(version, name);
                require('yargs')
                    .scriptName(scriptName)
                    .usage('$0 <cmd> [args]')
                    .command(command)
                    .help()
                    .alias('help', 'h')
                    .alias('version', 'v').argv;

                break;
            }
        }
    }
    catch (e) {
        if (e.code === 'MODULE_NOT_FOUND' && e.requireStack && e.requireStack[0] === require.resolve(__filename)) {
            // 没找到
            console.error(chalk.red(`[${cmdName}] command not found, you may install san-cli-${cmdName}`));
        }
        else {
            console.error(e);
        }
        process.exit(1);
    }
}

function checkNodeVersion(wanted, id) {
    if (!semver.satisfies(process.version, wanted)) {
        console.error(
            // prettier-ignore
            // eslint-disable-next-line
            'You are using Node ' + process.version + ', but this version of ' + id +
            ' requires ' + chalk.yellow('Node ' + wanted) + '.\nPlease upgrade your Node version.'
        );
        process.exit(1);
    }
}

function upNotifier(version, name) {
    let notifier;
    if (version && name) {
        // 检测版本更新
        notifier = updateNotifier({
            pkg: {
                name,
                version
            },
            updateCheckInterval: 1000 * 60 * 60 * 24 * 7, // 1 week
            isGlobal: true,
            // updateCheckInterval: 0,
            // npm script 也显示
            shouldNotifyInNpmScript: true
        });
    }
    ['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, () => {
            notifier && notifier.notify();
            process.exit(0);
        });
    });
}

function setProcess(scriptName) {
    process.title = scriptName;
    process.on('uncaughtException', error => {
        console.error(error);
        process.exit(1);
    });

    process.on('unhandledRejection', error => {
        console.error(error);
        process.exit(1);
    });
}
