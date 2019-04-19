#!/usr/bin/env node

/**
 * @file hulk bin 文件入口
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const chalk = require('chalk');
const semver = require('semver');
const program = require('commander');
const {
    engines: {node: requiredNodeVersion},
    name
} = require('../package.json');
const error = require('@baidu/hulk-utils/logger').error;

// 1. 检测 node 版本
checkNodeVersion(requiredNodeVersion, name);
// 2. 找不到命令的通用提示
program.arguments('<command>').action(cmd => {
    console.log();
    error(`Command: ${chalk.yellow(cmd)} not exist！`);
    console.log();
    program.outputHelp();
});
// 3. 挂载commands 下面的命令
['init', 'version', 'update', 'serve', 'build', 'component', 'lint', 'inspect'].forEach(cmd => {
    require(`../commands/${cmd}`)(program);
});

program.parse(process.argv);

function checkNodeVersion(wanted, id) {
    if (!semver.satisfies(process.version, wanted)) {
        error(`运行 ${chalk.yellow(id)} 需要 ${chalk.yellow(`Node ${wanted}`)}, 当前 Node ${process.version}. `);
        process.exit(1);
    }
}
