/**
 * @file 加载 Command 命令
 */

module.exports = Command => {
    const cwd = process.cwd();
    return (mod, argv = {}, opts = {}) => {
        const options = Command.parseOptions(Command.rawArgs);

        // TODO: 增加检测版本更新

        const isNotFoundError = err => {
            return err.message.match(/Cannot find module/);
        };
        // 当前操作路径
        // argv 是变量参数，例如 init <template> <appName>
        // opts 是配置，比如--o
        // Command 解析参数：{args,unknown}
        try {
            return require(`../command/${mod}`)(cwd, argv, opts, options);
        }
        catch (err) {
            if (isNotFoundError(err)) {
                try {
                    return require('import-global')(mod)(cwd, argv, opts, options);
                }
                catch (err2) {
                    if (isNotFoundError(err2)) {
                        const chalk = require('chalk');
                        const installCommand = 'npm install -g';
                        console.log();
                        console.log(
                            `  ${chalk.cyan(`hulk ${mod}`)} 没有安装，`
                            + `  请使用 ${chalk.cyan(`${installCommand} ${mod}`)} 安装后重试`
                        );
                        console.log();
                        process.exit(1);
                    }
                    else {
                        throw err2;
                    }
                }
            }
            else {
                throw err;
            }
        }
    };
};
