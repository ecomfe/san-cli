/**
 * @file update
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const importLazy = require('import-lazy')(require);
const rxjs = importLazy('rxjs');
const updateNotifier = importLazy('update-notifier');
const execa = importLazy('execa');
const inquirer = importLazy('inquirer');
const chalk = importLazy('chalk');
const semver = importLazy('semver');
const ConsoleTable = importLazy('tty-table');

// eslint-disable-next-line
const {NPM_REGISTRY, POSSIBLE_BREAKING_PACKAGES} = require('../../constants');

const {name, version} = require('../../package.json');
const TaskList = importLazy('../../lib/TaskList');
const error = require('@baidu/hulk-utils/logger').error;

const findOutdated = context => {
    return (ctx, task) => {
        return new rxjs.Observable(async observer => {
            observer.next('开始检测依赖...');
            try {
                await execa('npm', ['outdated', '--registry', NPM_REGISTRY], {
                    cwd: context
                });
                ctx.entries = [];
            } catch (e) {
                // outdated 的会 exitCode！=0
                observer.next('检测成功');
                const {stdout, stderr} = e;
                if (stderr) {
                    return observer.error(stderr);
                }
                const lines = stdout
                    .trim()
                    .split('\n')
                    .slice(1); // 第一行是表头
                const entries = lines.map(line => line.split(/ +/));
                ctx.entries = entries
                    .map(([name, current, wanted, latest]) => ({name, current, wanted, latest}))
                    .filter(({name}) => !POSSIBLE_BREAKING_PACKAGES.has(name));
            }
            observer.complete();
        });
    };
};
const updateCompatible = context => {
    return (ctx, task) => {
        return new rxjs.Observable(async observer => {
            observer.next('开始自动更新小版本兼容包...');
            const autoUpdates = ctx.entries.filter(({current, wanted}) => current !== wanted);
            if (autoUpdates.length > 0) {
                // 可以更新
                try {
                    observer.next();
                    await execa('npm', ['update', '--registry', NPM_REGISTRY], {
                        cwd: context,
                        stdio: ['inherit', 'inherit', 'inherit']
                    });
                    ctx.autoUpdates = autoUpdates;
                    observer.complete();
                } catch (e) {
                    observer.error(e);
                }
            } else {
                task.skip('没有新的小版本兼容包');
                observer.complete();
            }
        });
    };
};
const selectBreaking = context => {
    return (ctx, task) => {
        return new rxjs.Observable(async observer => {
            const entries = ctx.entries;
            const breakings = entries.filter(({name, wanted, latest}) => semver.gt(latest, wanted));
            const questions = [
                {
                    type: 'checkbox',
                    name: 'requiredUpdates',
                    message: '发现需要更新的包，请手动选择',
                    choices: breakings.map(({name, current, latest}) => {
                        return {
                            name: `${name} ${current} -> ${latest}`,
                            value: name
                        };
                    })
                }
            ];
            observer.next(); // 清空 loading
            const {requiredUpdates} = await inquirer.prompt(questions);
            ctx.requiredUpdates = entries.filter(({name}) => requiredUpdates.includes(name));
            observer.complete();
        });
    };
};
const updateBreaking = context => {
    return (ctx, task) => {
        return new rxjs.Observable(async observer => {
            const requiredUpdates = ctx.requiredUpdates;
            // 这里更新吧
            // observer.next('更新到最新版本ing...');
            observer.next();

            if (requiredUpdates && requiredUpdates.length) {
                const args = requiredUpdates.map(({name}) => name + '@latest');
                await execa('npm', ['install', ...args, '--registry', NPM_REGISTRY], {
                    cwd: context,
                    stdio: ['inherit', 'inherit', 'inherit']
                });
            } else {
                task.skip('没有新的包');
            }
            observer.complete();
        });
    };
};

module.exports = (context = process.cwd()) => {
    context = path.resolve(context);
    const taskList = [
        {title: '查找过期的依赖包...', task: findOutdated(context)},
        {title: '自动更新小版本兼容包...', task: updateCompatible(context)},
        {title: '请手动选择需要更新的依赖包...', task: selectBreaking(context)},
        {title: '更新选择的大版本依赖包...', task: updateBreaking(context)}
    ];
    // 检测版本更新
    const notifier = updateNotifier({
        pkg: {
            name,
            version
        },
        isGlobal: true,
        // updateCheckInterval: 0,
        // npm script 也显示
        shouldNotifyInNpmScript: true
    });

    const tasks = new TaskList(taskList);
    tasks
        .run()
        .then(ctx => {
            const {requiredUpdates = [], autoUpdates = []} = ctx;
            if (requiredUpdates.length || autoUpdates.length) {
                const toResult = targetVersionKey => entry => {
                    const targetVersion = entry[targetVersionKey];
                    return {
                        name: entry.name,
                        from: entry.current,
                        to: chalk.green(targetVersion)
                    };
                };
                const updates = [...autoUpdates.map(toResult('wanted')), ...requiredUpdates.map(toResult('latest'))];
                reportUpdateResult(updates);
                console.log();
                console.log('✨  更新完成！要养成定期检查过期包的好习惯哦O(∩_∩)O~');
            } else {
                console.log('✨  没有需要更新的包');
            }

            // 显示版本更新
            notifier.notify();
        })
        .catch(e => {
            error(e);
            // info(`使用 ${chalk.yellow('DEBUG=hulk:*')} 查看报错信息`);

            process.exit(1);
        });
};

function reportUpdateResult(updates) {
    const headers = [
        {value: 'name', alias: 'Name', align: 'left'},
        {value: 'from', alias: 'Current Version', align: 'left', width: 20},
        {value: 'to', alias: 'Updated Version', align: 'left', width: 20}
    ];
    const table = new ConsoleTable(headers, updates);
    console.log(table.render());
}
