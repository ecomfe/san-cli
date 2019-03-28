/**
 * @file inspect 检测webpack 配置
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const run = require('./run');
module.exports = program => {
    program
        .command('inspect [paths...]')
        .description('inspect internal webpack config')
        .option('--rule <ruleName>', 'inspect a specific module rule')
        .option('--plugin <pluginName>', 'inspect a specific plugin')
        .option('--rules', 'list all rule')
        .option('--plugins', 'list all plugin names')
        .option('--verbose', 'show full function definitions in output')
        .option('-m, --mode <mode>', 'set webpack mode', /^(development|production)$/i, 'production')
        .option('-c, --config <config>', 'set config file')
        .action(run);
};
