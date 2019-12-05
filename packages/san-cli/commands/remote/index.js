/**
 * @file add command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const {textColor} = require('san-cli-utils/randomColor');
exports.command = 'remote <subCommand>';
exports.aliases = ['plugin'];
const desc = '添加/管理脚手架 alias';
exports.desc = desc;
exports.builder = yargs => {
    if (yargs.argv._.length === 1) {
        const scriptName = yargs.$0;
        console.log(
            textColor(
                `Usage: ${scriptName[0].toUpperCase()}${scriptName.slice(
                    1
                )} remote <add|ls|rm|list|remove>`
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
