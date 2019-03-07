/**
 * @file hulk serve
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = program => {
    program
        .command('serve [entry]')
        .description('serve a .js or .san file in development mode with zero config')
        .option('-p, --port', 'dev server port')
        .action((entry, cmd) => {
            require('@baidu/hulk-serve').serve(entry, cleanArgs(cmd));
        });
};
