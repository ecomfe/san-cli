/**
 * @file hulk lint
 * @author luzhe <luzhe01@baidu.com>
 */

const run = require('./run');
module.exports = program => {
    program
        .command('lint [path]')
        // TODO 输出到文件
        .description('基于ecomfe规则的代码校验工具')
        .action(run);
};
