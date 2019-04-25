/**
 * @file hulk build
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const run = require('./run');
module.exports = program => {
    program
        .command('build [entry]')
        .description('0配置打包')
        .option('-d, --dest <dir>', '输出文件路径')
        .option('--analyze', '分析 bunlde')
        // .option('--modern', 'modern browser build (default: false)')
        .option('--watch', 'watch 模式')
        .option('--no-clean', '在构建之前清理目标目录')
        .option('-m, --mode <mode>', '设置 webpack mode', /^(development|production)$/i, 'production')
        .option('-c, --config <config>', '指定 webpack config 地址')
        .action(run);
};
