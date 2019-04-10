/**
 * @file inspect 检测webpack 配置
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const run = require('./run');
module.exports = program => {
    program
        .command('inspect [paths...]')
        .description('检查内置 webpack 配置')
        .option('--rule <ruleName>', '根据 module 规则名称输出配置')
        .option('--plugin <pluginName>', '根据插件名称输出配置')
        .option('--rules', '显示所有 module 规则')
        .option('--plugins', '显示所有插件名称')
        .option('-m, --mode <mode>', '设置 webpack mode', /^(development|production)$/i, 'production')
        .option('-c, --config <config>', '设置 webpack config 文件')
        .action(run);
};
