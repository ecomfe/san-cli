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
// eslint-disable-next-line
const {NPM_REGISTRY, POSSIBLE_BREAKING_PACKAGES} = require('../../constants');

const {name, version} = require('../../package.json');
const TaskList = importLazy('../../lib/TaskList');
const {log, success, error} = require('@baidu/hulk-utils/logger');

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
                ctx.entries = entries.map(([name, current, wanted, latest]) => ({name, current, wanted, latest}));
            }
            observer.complete();
        });
    };
};
const updateCompatible = context => {
    return (ctx, task) => {
        return new rxjs.Observable(async observer => {
            observer.next('开始自动更新小版本兼容包...');
            const autoUpdates = ctx.entries
                .filter(({name}) => !POSSIBLE_BREAKING_PACKAGES.has(name))
                .filter(({current, wanted}) => current !== wanted);
            if (autoUpdates.length > 0) {
                // 可以更新
                try {
                    observer.next();
                    await execa('npm', ['update', '--registry', NPM_REGISTRY], {
                        cwd: context,
                        stdio: ['pipe', 'pipe', 'pipe']
                    });
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
        return new rxjs.Observable(observer => {
            // const checkBreakings = async (entries: OutdatedInfo[]): Promise<OutdatedInfo[]> => {
            //     const breakings = entries.filter(isBreakingUpdate);
            //     const questions = [
            //         {
            //             type: 'checkbox',
            //             name: 'requiredUpdates',
            //             message: 'Found breaking updates as follows, select to update.',
            //             choices: breakings.map(toChoice),
            //         },
            //     ];
            //     const {requiredUpdates} = await inquirer.prompt<BreakingUpdate>(questions);
            //     return entries.filter(({name}) => requiredUpdates.includes(name));
            // };
        });
    };
};
const updateBreaking = context => {
    return (ctx, task) => {
        return new rxjs.Observable(observer => {});
    };
};

module.exports = (context = process.cwd()) => {
    context = path.resolve(context);
    const taskList = [
        {title: '查找过期的依赖包...', task: findOutdated(context)},
        {title: '自动更新小版本兼容包...', task: updateCompatible(context)},
        {title: '请手动选择需要更新的大版本依赖包...', task: selectBreaking(context)},
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
            console.log(ctx);
            // 显示版本更新
            notifier.notify();
        })
        .catch(e => {
            error(e);
            // info(`使用 ${chalk.yellow('DEBUG=hulk:*')} 查看报错信息`);

            process.exit(1);
        });
};
