/**
 * @file hulk outdate
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = program => {
    program
        .command('update [packageName...]')
        .description('升级 npm 模块，自动区分百度私有包')
        .allowUnknownOption()
        .action((packageName, cmd) => {
            loadCommand('update', packageName, cleanArgs(cmd));
        });
};
