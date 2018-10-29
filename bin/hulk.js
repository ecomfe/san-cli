#!/usr/bin/env node
/**
 * @file hulk bin 文件
 */
const chalk = require('chalk');
const semver = require('semver');
const requiredVersion = require('../package.json').engines.node;
function checkNodeVersion(wanted, id) {
    if (!semver.satisfies(process.version, wanted)) {
        console.log(chalk.red(
            '当前你的 Node 版本为 ' + process.version + '，运行 ' + id
            + ' 需要 Node ' + wanted + ' 以上版本。\n请升级你的 Node'
        ));
        process.exit(1);
    }
}
checkNodeVersion(requiredVersion, 'hulk-cli');
const program = require('commander');
const loadCommand = require('../lib/load-command')(program);
const versionCommand = require('../command/version');

program
    .version(require('../package').version, '-v --version')
    .usage('<command> [options]');
// 重新使用 version，带检查更新
program.removeAllListeners('option:version').on('option:version', versionCommand);

program
    .command('init <template> <appName>')
    .description('通过模板初始化项目')
    .option('-o, --offline', '这是一个本地路径')
    .option('-h, --https', 'Git 使用 https 请求')
    .option('-u, --user <user>', 'Git 用户名，默认：git')
    .option('-I, --install', '安装依赖，默认：不安装')
    .option('-f, --force', 'force', '强制删除已存在的目录，默认：删除')
    .option('-r, --registry <registry>', '设置 npm registry')
    .option('-c, --cache', '优先使用缓存')
    .action((template, appName, cmd) => {
        loadCommand('init', {
            template,
            appName
        }, cmd);
    });

program
    .command('template <appName>')
    .option('-c, --cache', '优先使用缓存')
    .option('-h, --https', 'Git 使用 https 请求')
    .option('-f, --force', 'force', '强制删除已存在的目录，默认：删除')
    .description('生成一个项目模板')
    .action((appName, cmd) => {
        loadCommand('template', {
            appName
        }, cmd);
    });

program
    .command('install [packageName...]')
    .description('安装 npm 模块，自动区分百度私有包')
    .allowUnknownOption()
    .action((packageName, cmd) => {

        loadCommand('install', packageName, cmd);
    });

program
    .command('update [packageName...]')
    .description('升级 npm 模块，自动区分百度私有包')
    .allowUnknownOption()
    .action((packageName, cmd) => {
        loadCommand('update', packageName, cmd);
    });

program
    .command('upgrade')
    .description('检测并升级 CLI 版本')
    .option('--verbose', 'verbose 模式')
    .allowUnknownOption()
    .action(cmd => {
        loadCommand('upgrade', cmd);
    });

program
    .arguments('<command>')
    .action(cmd => {
        program.outputHelp();
        console.log('  ' + chalk.red(`找不到命令 ${chalk.yellow(cmd)}.`));
        console.log();
    });

program.on('--help', () => {
    console.log();
    console.log(`  使用 ${chalk.cyan('hulk <command> --help')} 查看帮助`);
    console.log();
});
program.commands.forEach(c => c.on('--help', () => console.log()));

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
}
