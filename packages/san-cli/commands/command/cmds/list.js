/**
 * @file 给 comand 命令添加 list 功能
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
exports.command = 'list';
exports.aliases = ['ls'];

exports.builder = {
    global: {
        alias: 'g',
        describe: 'Get globally command',
        type: 'boolean',
        default: false
    },
    all: {
        alias: 'a',
        describe: '列出所有的command 命令',
        type: 'boolean',
        default: false
    }
};
exports.handler = argv => {
    const readRc = require('../../../lib/readRcFile');
    const {log} = require('san-cli-utils/ttyLogger');
    if (argv.global || argv.all) {
        const rc = readRc('rc');
        if (!rc || !rc.commands || rc.commands.length === 0) {
            log('Your global sub-command list is empty!');
        } else {
            log('Your global sub-command in `sanrc.json` :');
            rc.commands.forEach(cmd => log(`- ${cmd}`));
        }

        if (!argv.all) {
            // 到此结束
            return;
        }
    }
    const pkgRc = readRc('package.json');
    if (!pkgRc || !pkgRc.commands || pkgRc.commands.length === 0) {
        log('Your local sub-command list is empty!');
    } else {
        log('Your local sub-command in `package.json` :');
        pkgRc.commands.forEach(cmd => log(`- ${cmd}`));
    }

    if (!argv.all) {
        // 到此结束
        log(`Use \`${'-g'}\` flag to show global sub-command.`);
    }
};
