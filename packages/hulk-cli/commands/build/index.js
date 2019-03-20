/**
 * @file hulk build
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const run = require('./run');
module.exports = program => {
    program
        .command('build [entry]')
        .description('build in production mode with zero config')
        .option('-d, --dest <dir>', 'output directory', 'dist')
        .option('--analyze', 'analyze bundle')
        .option('--modern', 'modern browser build (default: false)')
        .option('--watch', 'watch mode (default: false)')
        .option('--no-clean', 'clean dest directory before build')
        .option('-m, --mode <mode>', 'webpack mode', /^(development|production)$/i, 'production')
        .option('-c, --config <config>', 'set config file')
        .action(run);
};
