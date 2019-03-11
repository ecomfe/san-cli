/**
 * @file hulk component
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = program => {
    program
        .command('component [entry]')
        .description('san component demo preview server')
        .option('-p, --port', 'dev server port')
        .action((entry, cmd) => {
            require('@baidu/hulk-command-component')(entry, cmd);
        });
};
