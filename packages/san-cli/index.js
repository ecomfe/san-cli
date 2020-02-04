#!/usr/bin/env node

/**
 * @file hulk bin 文件入口
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable no-console */
const updateNotifier = require('update-notifier');
const semver = require('semver');

const {error, chalk, time, timeEnd} = require('@baidu/san-cli-utils/ttyLogger');
const Commander = require('./lib/Commander');
const {
    scriptName,
    engines: {node: requiredNodeVersion},
    name: pkgName,
    version: pkgVersion
} = require('./package.json');

// set process
process.title = scriptName;
require('./lib/processLog');
// 1. 检测 node 版本
checkNodeVersion(requiredNodeVersion, pkgName);
// 2. 检测最新版本
upNotifier(pkgVersion, pkgName);
// 3. 加载全部的命令
const cli = new Commander();
// 4. 触发执行
cli.run(process.argv.slice(2));

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
