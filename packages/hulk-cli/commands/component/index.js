/**
 * @file hulk component
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const run = require('./run');

module.exports = program => {
    program
        .command('component <entry>')
        .alias('md')
        .description('san component demo preview server')
        .option('-p, --port <port>', 'dev server port', /\d+/, 8899)
        .option('-h, --host <host>', 'dev server host')
        .option('-m, --mode <mode>', 'webpack mode', /^(development|production)$/i, 'development')
        .option('-c, --config <config>', 'set config file')
        .option('--use-https', 'use https')
        .action(run);
};
