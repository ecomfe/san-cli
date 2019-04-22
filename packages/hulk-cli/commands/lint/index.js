/**
 * @file hulk lint
 * @author luzhe <luzhe01@baidu.com>
 */

const run = require('./run');
module.exports = program => {
    program
        .command('lint [path]')
        .description('代码校验工具，按照厂内FE规范进行本地校验，可手动执行，或安装git hooks，在commit前自动校验')
        .option('-i, --install', '安装git hooks工具')
        .action(run);
};
