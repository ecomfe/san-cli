/**
 * @file add command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

function addFactory(propName = 'commands', validate = () => true) {
    return {
        command: 'add <name>',
        description: 'Add a subcommand to San CLI',
        builder: {
            global: {
                alias: 'g',
                describe: 'Add globally command',
                type: 'boolean',
                default: false
            }
        },
        handler(argv) {
            const path = require('path');
            const fse = require('fs-extra');
            const readRc = require('./readRc');
            const readPkg = require('read-pkg');
            const writePkg = require('write-pkg');
            const {requireFromLocal} = require('./utils');

            const cmd = argv.name;
            let result = cmd;

            if (path.isAbsolute(cmd)) {
                // 绝对地址
            } else if (cmd.indexOf('.') === 0) {
                // 相对路径
                result = path.join(process.cwd(), cmd);
                result = requireFromLocal(result);
            } else {
                // 优先 local
                result = requireFromLocal(cmd);
                if (!result || validate(result)) {
                    // 本地找不到，或者找到的是错误的
                    // import-global
                    const gloablModule = require('import-global').silent(cmd);
                    if (gloablModule && validate(gloablModule)) {
                        // 认证通过
                        result = cmd;
                    }
                }
            }
            const {error, log, success} = require('@baidu/san-cli-utils/ttyLogger');
            if (!result) {
                // 这里报错吧
                error(`Cannot find module \`${cmd}\``);
                log('Please install it and try again');
                process.exit(1);
            }
            const {getGlobalSanRcFilePath} = require('@baidu/san-cli-utils/path');

            // 检测是否存在
            if (argv.global) {
                // 全局
                let sanrc = readRc('rc') || {};
                let commands = sanrc[propName] || [];
                if (commands.find(i => i === result)) {
                    error(`\`${cmd}\` has been in \`sanrc.json\`.`);
                    process.exit(1);
                }
                commands.push(result);
                sanrc[propName] = commands;
                let filepath = getGlobalSanRcFilePath();
                fse.writeJsonSync(filepath, sanrc);
            } else {
                // 本地存在 package.json san 字段
                const cwd = process.cwd();
                const pkg = readPkg.sync({cwd});

                const san = pkg.san || {};
                // 处理成相对路径
                result = path.relative(cwd, result);
                let commands = san[propName] || [];
                if (commands.find(i => i === result)) {
                    error(`\`${cmd}\` has been in package.json's \`.san\` property.`);
                    process.exit(1);
                }
                commands.push(result);
                san[propName] = commands;
                pkg.san = san;
                // 写入 package.json
                writePkg.sync(cwd, pkg);
            }
            success(`Add \`${cmd}\` success!`);
        }
    };
}

exports.addFactory = addFactory;

exports.removeFactory = (propName = 'commands', validate = () => true) => {
    return {
        command: 'remove <name>',
        builder: {
            global: {
                alias: 'g',
                describe: 'Remove global command',
                type: 'boolean',
                default: false
            }
        },
        handler(argv) {
            const path = require('path');
            const readRc = require('./readRc');
            const fse = require('fs-extra');
            const readPkg = require('read-pkg');

            const writePkg = require('write-pkg');

            const {success, error} = require('@baidu/san-cli-utils/ttyLogger');
            const {requireFromLocal} = require('./utils');
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
                if (!(result && validate(result))) {
                    result = cmd;
                }
            }
            if (!result) {
                // 这里报错吧
                error(`Cannot find module \`${cmd}\``);
                process.exit(1);
            }
            const {getGlobalSanRcFilePath} = require('@baidu/san-cli-utils/path');

            let from = 'local `package.json`';
            // 检测是否存在
            if (argv.global) {
                from = 'global `sanrc.json`';
                // 全局
                const filepath = getGlobalSanRcFilePath();
                let sanrc = readRc('rc') || {};

                let commands = sanrc[propName] || [];
                const indexOf = commands.indexOf(result);
                if (indexOf !== -1) {
                    commands.splice(indexOf, 1);
                    sanrc[propName] = commands;
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
                let commands = san[propName] || [];

                const indexOf = commands.indexOf(result);
                if (indexOf !== -1) {
                    commands.splice(indexOf, 1);
                    san[propName] = commands;
                    pkg.san = san;
                    // 写入 package.json
                    writePkg.sync(cwd, pkg);
                } else {
                    error(`\`${cmd}\` cannot find in ${from}'s \`.san\` property.`);
                    process.exit(1);
                }
            }
            success(`Remove \`${cmd}\` from ${from} success!`);
        }
    };
};

exports.listFactory = (propName = 'commands') => {
    return {
        command: 'list',
        builder: {
            global: {
                alias: 'g',
                describe: 'Get globally command',
                type: 'boolean',
                default: false
            },
            all: {
                alias: 'a',
                describe: 'List all commands',
                type: 'boolean',
                default: false
            }
        },
        handler(argv) {

            const readRc = require('./readRc');
            const {log} = require('@baidu/san-cli-utils/ttyLogger');
            if (argv.global || argv.all) {
                const rc = readRc('rc');
                if (!rc || !rc[propName] || rc[propName].length === 0) {
                    log(`Your global ${propName} list is empty!`);
                    console.log();
                } else {
                    log(`Your global ${propName} in \`sanrc.json\` :`);
                    rc[propName].forEach(cmd => log(`    - ${cmd}`));
                }

                if (!argv.all) {
                    // 到此结束
                    return;
                }
            }
            const pkgRc = readRc('package.json');
            if (!pkgRc || !pkgRc[propName] || pkgRc[propName].length === 0) {
                log(`Your local ${propName} list is empty!`);
                console.log();
            } else {
                log(`  Your local ${propName} in \`sanrc.json\` :`);
                pkgRc.commands.forEach(cmd => log(`  - ${cmd}`));
            }

            if (!argv.all) {
                console.log();
                // 到此结束
                log(`Use \`${'-g'}\` flag to show global ${propName}.`);
                console.log();
            }
        }
    };
};
