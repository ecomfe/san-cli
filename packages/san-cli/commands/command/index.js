/**
 * @file add command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const path = require('path');
const {textColor} = require('san-cli-utils/randomColor');
exports.command = 'command <subCommand>';
exports.aliases = ['cmd'];
const desc = '扩展、管理 CLI 的命令';
exports.desc = desc;
exports.builder = yargs => {
    if (yargs.argv._.length === 1) {
        const scriptName = yargs.$0;
        console.log(
            textColor(
                `Usage: ${scriptName[0].toUpperCase()}${scriptName.slice(1)} command [add|ls|rm|list|remove] [flags]`
            )
        );
        console.log();
        console.log(desc);
        console.log();

        yargs.showHelp();
        process.exit();
    }

    return yargs.commandDir(path.join(__dirname, './cmds'));
};
exports.handler = argv => {};
