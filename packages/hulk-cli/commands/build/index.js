/**
 * @file hulk build
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const run = require('./run');
module.exports = program => {
    program
        .command('build [entry]')
        .description('内置 Webpack 零配置打包')
        .option('-d, --dest <dir>', '输出文件路径')
        .option('--analyze', '分析 bunlde')
        .option('--modern', 'modern mode')
        .option('--watch', 'watch 模式')
        .option('-m, --mode <mode>', '设置 webpack mode', /^(development|production)$/i, 'production')
        .option('-c, --config <config>', '指定 webpack config 地址')
        .option('--no-clean', '构建之前不删除 dist 目录')
        .action(run);
};
