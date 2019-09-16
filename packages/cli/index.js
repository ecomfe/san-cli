#!/usr/bin/env node

/**
 * @file hulk bin 文件入口
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable no-console */

const path = require('path');
const updateNotifier = require('update-notifier');
const yargs = require('yargs/yargs');
const semver = require('semver');
const npmlog = require('npmlog');

const {error, chalk} = require('@hulk/core/ttyLogger');

const {
    scriptName,
    engines: {node: requiredNodeVersion},
    name: pkgName,
    version: pkgVersion
} = require('./package.json');

// 1. 检测 node 版本
checkNodeVersion(requiredNodeVersion, pkgName);

// 2. 检测最新版本
upNotifier(pkgVersion, pkgName);

// 3. 加载全部的命令
const buildinCmds = ['build', 'init', 'serve', 'inspect'];
const cmd = process.argv[2] || '';
// 内置的命令
const cli = yargs();

cli.scriptName(scriptName)
    .usage('Usage: $0 <command> [options]')
    .option('verbose', {
        type: 'boolean',
        describe: 'output verbose messages on internal operations'
    })

    .option('log-level', {
        alias: 'logLevel',
        default: 'silent',
        hidden: true,
        choices: ['info', 'debug', 'warn', 'error', 'silent', 'notice', 'silly', 'timing', 'http'],
        type: 'string',
        describe: 'set log level'
    })
    .wrap(cli.terminalWidth())
    .middleware(function getCommonArgv(argv) {
        // 利用中间件机制，增加公共参数处理和函数等
        if (argv.verbose) {
            // 增加 logger
            npmlog.level = 'info';
        } else {
            npmlog.level = argv.logLevel;
        }
        // eslint-disable-next-line
        return {_cwd: process.cwd(), _logger: npmlog, _version: pkgVersion, _scriptName: scriptName};
    })
    .alias('h', 'help')
    .alias('v', 'version');
if (~buildinCmds.indexOf(cmd) || cmd === '' || cmd.indexOf('-') === 0) {
    buildinCmds.forEach(cmd => {
        const instance = require(path.join(__dirname, `./commands/${cmd}`));
        cli.command(instance);
    });

    cli.parse(process.argv.slice(2));
} else {
    // 默认
    require('./commands/default')(cli, cmd, process.argv.slice(2));
}

function checkNodeVersion(wanted, id) {
    if (!semver.satisfies(process.version, wanted)) {
        error(
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
