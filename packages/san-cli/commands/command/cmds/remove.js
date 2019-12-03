/**
 * @file 给 command 命令添加 remove 功能
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
exports.command = 'remove <name>';
exports.aliases = ['rm'];

exports.builder = {
    global: {
        alias: 'g',
        describe: 'Remove globally command',
        type: 'boolean',
        default: false
    }
};

exports.handler = argv => {
    const path = require('path');
    const readRc = require('../../../lib/readRcFile');
    const fse = require('fs-extra');
    const readPkg = require('read-pkg');

    const writePkg = require('write-pkg');

    const {success, error} = require('san-cli-utils/ttyLogger');
    const {requireFromLocal, validate} = require('../utils');
    const cmd = argv.name;

    let result = cmd;

    if (path.isAbsolute(cmd)) {
        // 绝对地址
    } else if (cmd.indexOf('.') === 0) {
        // 相对路径
        result = path.join(process.cwd(), cmd);
        result = requireFromLocal(result);
    } else {
        // import-cwd
        result = requireFromLocal(cmd);
        if (!result) {
            // 优先 local
            // import-global
            const gloablModule = require('import-global').silent(cmd);
            if (!validate(gloablModule)) {
                result = cmd;
            }
        }
    }
    if (!result) {
        // 这里报错吧
        error(`Cannot find module \`${cmd}\``);
        process.exit(1);
    }
    const {getGlobalSanRcFilePath} = require('san-cli-utils/path');

    let from = 'local `package.json`';
    // 检测是否存在
    if (argv.global) {
        from = 'global `sanrc.json`';
        // 全局
        const filepath = getGlobalSanRcFilePath();
        let sanrc = readRc('rc') || {};

        let commands = sanrc.commands || [];
        const indexOf = commands.indexOf(result);
        if (indexOf !== -1) {
            commands.splice(indexOf, 1);
            sanrc.commands = commands;
            fse.writeJsonSync(filepath, sanrc);
        } else {
            error(`\`${cmd}\` cannot find in ${from}.`);
            process.exit(1);
        }
    } else {
        // 本地存在 package.json san 字段
        const cwd = process.cwd();
        const pkg = readPkg.sync({cwd});
        const san = pkg.san || {};
        let commands = san.commands || [];

        const indexOf = commands.indexOf(result);
        if (indexOf !== -1) {
            commands.splice(indexOf, 1);
            san.commands = commands;
            pkg.san = san;
            // 写入 package.json
            writePkg.sync(cwd, pkg);
        } else {
            error(`\`${cmd}\` cannot find in ${from}'s \`.san\` property.`);
            process.exit(1);
        }
    }
    success(`Remove \`${cmd}\` from ${from} success!`);
};
