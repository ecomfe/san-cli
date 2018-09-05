/**
 * @file 加载 Command 命令
 */

module.exports = (mod, argv = {}, opts = {}) => {
    // TODO: 增加检测版本更新

    const isNotFoundError = err => {
        return err.message.match(/Cannot find module/);
    };
    // 当前操作路径
    // argv 是变量参数，例如 init <template> <appName>
    // opts 是配置，比如--o
    try {
        return require(`../command/${mod}`)(process.cwd(), argv, opts);
    }
    catch (err) {
        console.log(err)
        if (isNotFoundError(err)) {
            try {
                return require('import-global')(mod)(process.cwd(), argv, opts);
            }
            catch (err2) {
                if (isNotFoundError(err2)) {
                    const chalk = require('chalk');
                    const installCommand = `npm install -g`;
                    console.log();
                    console.log(
                        `  Command ${chalk.cyan(`hulk ${mod}`)} requires a global addon to be installed.`
                        + `  Please run ${chalk.cyan(`${installCommand} ${mod}`)} and try again.`
                    );
                    console.log();
                    process.exit(1);
                }
                else {
                    throw err2
                }
            }
        }
        else {
            throw err
        }
    }
};
