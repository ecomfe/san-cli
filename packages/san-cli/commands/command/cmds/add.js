/**
 * @file add command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

exports.command = 'add <name>';
exports.desc = '给 San CLI 添加一个子命令';
exports.builder = {
    global: {
        alias: 'g',
        describe: 'Add globally command',
        type: 'boolean',
        default: false
    }
};
exports.handler = argv => {
    const path = require('path');
    const fse = require('fs-extra');
    const readRc = require('../../../lib/readRcFile');
    const readPkg = require('read-pkg');
    const writePkg = require('write-pkg');
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

    const {error, log, success} = require('san-cli-utils/ttyLogger');
    if (!result) {
        // 这里报错吧
        error(`Cannot find module \`${cmd}\``);
        log('Please install it and try again');
        process.exit(1);
    }
    const {getGlobalSanRcFilePath} = require('san-cli-utils/path');

    // 检测是否存在
    if (argv.global) {
        // 全局
        let sanrc = readRc('rc') || {};
        let commands = sanrc.commands || [];
        if (commands.find(i => i === result)) {
            error(`\`${cmd}\` has been in \`sanrc.json\`.`);
            process.exit(1);
        }
        commands.push(result);
        sanrc.commands = commands;
        let filepath = getGlobalSanRcFilePath();
        fse.writeJsonSync(filepath, sanrc);
    } else {
        // 本地存在 package.json san 字段
        const cwd = process.cwd();
        const pkg = readPkg.sync({cwd});

        const san = pkg.san || {};
        // 处理成相对路径
        result = path.relative(cwd, result);
        let commands = san.commands || [];
        if (commands.find(i => i === result)) {
            error(`\`${cmd}\` has been in package.json's \`.san\` property.`);
            process.exit(1);
        }
        commands.push(result);
        san.commands = commands;
        pkg.san = san;
        // 写入 package.json
        writePkg.sync(cwd, pkg);
    }
    success(`Success add \`${cmd}\` command!`);
};
