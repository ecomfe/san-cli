/**
 * @file hulk build
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = program => {
    program
        .command('build [entry]')
        .description('build a .js or .san file in production mode with zero config')
        .option('-d, --dest <dir>', 'output directory (default: dist)')
        .action((entry, cmd) => {
            require('@baidu/hulk-serve').build(entry, cleanArgs(cmd));
        });
};
