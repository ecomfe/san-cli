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
        .option('--analyze', 'webpack-analyze-bunlde 模式')
        .option('--modern', 'modern 模式打包')
        .option('--watch', 'watch 模式')
        .option('--sentry', '开启Sentry线上错误监控')
        .option('-m, --mode <mode>', '设置 webpack mode', /^(development|production)$/i, 'production')
        .option('-c, --config <config>', '指定 webpack config 地址')
        .option('--no-clean', '构建之前不删除 dist 目录')
        .option('--no-colors, --no-color', 'log 不显示颜色')
        .option('--no-progress', '不显示进度条')
        // Accepted values: none, errors-only, minimal, normal, detailed, verbose
        // Any other falsy value will behave as 'none', truthy values as 'normal'
        .option(
            '--stats <stats>',
            '显示webpack stats 参数',
            /^(none|table|errors-only|minimal|normal|table|detailed)$/i,
            'table'
        )
        .option('--verbose', 'verbose log')
        .option('--report-json', '生成打包报告 report.json')
        .option('--report', '生成打包报告 report.html')
        .option('-e, --matrix-env <matrix-env>', '使用matrix loader，指定matrix的环境，main/kdd/lite/other')
        .option('-x, --matrix', '对matrix编译产出进行聚合')
        .action(run);
};
