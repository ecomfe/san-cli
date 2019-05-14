#!/usr/bin/env node

/**
 * @file hulk bin 文件入口
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable no-console */

const semver = require('semver');
const program = require('commander');
const {
    engines: {node: requiredNodeVersion},
    name,
    version
} = require('../package.json');

const chalk = require('@baidu/hulk-utils/chalk');
const error = require('@baidu/hulk-utils/logger').error;

// 1. 检测 node 版本
checkNodeVersion(requiredNodeVersion, name);

// 2. 挂载commands 下面的命令
// 首先判断对应的命令之后再 require
const cmd = process.argv[2];
const commands = ['init', 'update', 'serve', 'build', 'component', 'lint', 'inspect'];

if (commands.includes(cmd)) {
    if (!process.env.HULK_CLI_MODERN_BUILD) {
        // modern 打包不要输出这个了
        console.log(chalk.bold(`hulk ${cmd} v${version}`));
    }
    require(`../commands/${cmd}`)(program);
} else {
    // 添加 version
    require('../commands/version')(program);

    // 3. 找不到命令的通用提示
    program.arguments('<command>').action(cmd => {
        console.log();
        error(`Command: ${chalk.yellow(cmd)} not exist！`);
        console.log();
        program.outputHelp();
    });

    program.on('--help', () => {
        console.log('');
        console.log(`Commands:
  hulk init <template> <appName>  通过项目脚手架生成项目，支持 iCode/Github Repo
  hulk serve [entry]              零配置针对 .js/.san 文件启动开发模式编译
  hulk build [entry]              内置 Webpack 零配置打包
  hulk component <entry>          San 组件 Demo 预览服务器
  hulk lint [path]                代码校验工具，按照厂内FE规范进行本地校验
  hulk update [path]              执行npm outdated，升级目录下面的依赖
  hulk inspect [paths...]         检查内置 Webpack 配置`);
        console.log('');
        console.log(`Command Alias:
  init: new
  serve: dev
  component: md`);
        console.log(`
Run \`${chalk.bold('hulk COMMAND -h')}\` for more information on specific commands.
Visit ${chalk.bold('http://hulk.baidu-int.com/docs/hulk/')} to learn more about Hulk.
    `);
    });
    // 默认执行 hulk，则输出 help
    if (process.argv.length === 2) {
        program.outputHelp();
    }
}

// ['init', 'version', 'update', 'serve', 'build', 'component', 'lint', 'inspect'].forEach(cmd => {
//     require(`../commands/${cmd}`)(program);
// });

program.parse(process.argv);

function checkNodeVersion(wanted, id) {
    if (!semver.satisfies(process.version, wanted)) {
        error(`运行 ${chalk.yellow(id)} 需要 ${chalk.yellow(`Node ${wanted}`)}, 当前 Node ${process.version}. `);
        process.exit(1);
    }
}
