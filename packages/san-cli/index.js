#!/usr/bin/env node

/**
 * @file hulk bin 文件入口
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable no-console */
const updateNotifier = require('update-notifier');
const semver = require('semver');

const {error, chalk, time, timeEnd, debug} = require('san-cli-utils/ttyLogger');
const commander = require('./lib/commander');
const {
    scriptName,
    engines: {node: requiredNodeVersion},
    name: pkgName,
    version: pkgVersion
} = require('./package.json');

// set process
process.title = scriptName;
require('./lib/processLog');
// 1. 检测 node 版本
checkNodeVersion(requiredNodeVersion, pkgName);

// 2. 检测最新版本
upNotifier(pkgVersion, pkgName);
// 3. 加载全部的命令
const constant = require('./lib/const');
const buildinCmds = constant.buildinCommands;
// 4. 内置的命令
const cli = commander();
buildinCmds.forEach(cmd => {
    time(`load-${cmd}`);
    const instance = require(`./commands/${cmd}`);
    cli.command(instance);
    timeEnd(`load-${cmd}`);
});

// 5. 加载 cli rc 扩展命令
// 通过 rc 文件预设的默认值，包括扩展的 command
// 原则：
// 1. rc 文件应该尽量「表现的显性」
// 2. 对于每个执行命令的 fe 应该清楚自己的环境，而不是稀里糊涂的用全局 rc
// 3. 方便配置默认 preset 统一命令和配置
time('loadRc');
const {commands, servicePlugins, useBuiltInPlugin = true, templateAlias} = require('./lib/loadRc')();
timeEnd('loadRc');
if (Array.isArray(commands)) {
    // 扩展命令行
    /* eslint-disable no-undef */
    const unique = new Set();
    /* eslint-enable no-undef */
    commands.forEach(cmd => {
        if (!cmd || unique.has(commands[cmd])) {
            // 保证唯一性
            return;
        }
        time(`load-${cmd}`);
        const instance = typeof cmd === 'string' ? require(cmd) : cmd;
        if (instance && instance.command) {
            unique.add(cmd);
            cli.command(instance);
        } else {
            error(`${cmd} is not a validate command instance!`);
        }
        timeEnd(`load-${cmd}`);
    });
}

cli.middleware(argv => {
    // 将 rc 的内容加到 argv，直接传值，避免二次加载
    return {
        /* eslint-disable fecs-camelcase */
        _presets: {
            templateAlias,
            servicePlugins,
            useBuiltInPlugin
        }
        /* eslint-enable fecs-camelcase */
    };
});

// 6. 触发执行
cli.parse(process.argv.slice(2));

function checkNodeVersion(wanted, id) {
    if (!semver.satisfies(process.version, wanted)) {
        error(
            // prettier-ignore
            // eslint-disable-next-line
            'You are using Node ' + process.version + ', but this version of ' + id +
            ' requires ' + chalk.yellow('Node ' + wanted) + '.\nPlease upgrade your Node version.'
        );
        process.exit(1);
    }
}

function upNotifier(version, name) {
    let notifier;
    if (version && name) {
        // 检测版本更新
        notifier = updateNotifier({
            pkg: {
                name,
                version
            },
            updateCheckInterval: 1000 * 60 * 60 * 24 * 7, // 1 week
            isGlobal: true,
            // updateCheckInterval: 0,
            // npm script 也显示
            shouldNotifyInNpmScript: true
        });
    }
    ['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, () => {
            notifier && notifier.notify();
            process.exit(0);
        });
    });
}
