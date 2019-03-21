/**
 * @file hulk serve
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const run = require('./run');
module.exports = program => {
    program
        .command('serve [entry]')
        .alias('dev')
        .description('serve a .js or .san file in development mode with zero config')
        .option('-p, --port <port>', 'dev server port', /\d+/, 8899)
        .option('-h, --host <host>', 'dev server host')
        .option('-m, --mode <mode>', 'webpack mode', /^(development|production)$/i, 'development')
        .option('-c, --config <config>', 'set config file')
        .option('--use-https', 'use https')
        .action(run);
};
