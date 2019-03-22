/**
 * @file hulk serve
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const run = require('./run');
const {ENV, DEVELOPMENT_MODE} = require('../../constants');

module.exports = program => {
    const envReg = new RegExp('^(' + ENV.join('|') + ')$', 'i');
    program
        .command('serve [entry]')
        .alias('dev')
        .description('serve a .js or .san file in development mode with zero config')
        .option('-p, --port <port>', 'dev server port', /\d+/, 8899)
        .option('-h, --host <host>', 'dev server host')
        .option('-m, --mode <mode>', 'webpack mode', envReg, DEVELOPMENT_MODE)
        .option('-c, --config <config>', 'set config file')
        .option('--use-https', 'use https')
        .action(run);
};
