/**
 * @file init 初始化项目
 */
const path = require('path');

const delay = require('delay');
const fs = require('fs-extra');
const chalk = require('chalk');
const home = require('user-home');
const boxen = require('boxen');

const Observable = require('rxjs').Observable;
const semver = require('semver');
const render = require('consolidate').handlebars.render;

const inquirer = require('inquirer');
const Handlebars = require('../../lib/handlerbars');
const generator = require('../../lib/generator');
const {name, version: localVersion} = require('../../package.json');
const {log, success, error, newVersionLog} = require('@baidu/hulk-utils/logger');
const {getLatestVersion} = require('@baidu/hulk-utils/get-latest-version');
const {isLocalPath, getTemplatePath, downloadRepo, installDeps} = require('@baidu/hulk-utils');

const TaskList = require('./TaskList');

const ALIAS_MAP = process.env.alias || {
    component: 'antd-san-component-template',
    project: 'san-project-base'
};
const alias = name => {
    if (ALIAS_MAP[name]) {
        return ALIAS_MAP[name];
    }
    return name;
};

// 检测版本更新
let newVersion = 0;
// TODO 这里改成单独现成获取，不占用资源？
getLatestVersion().then(latest => {
    if (semver.lt(localVersion, latest)) {
        newVersion = latest;
    }
});

module.exports = async (template, appName, opts) => {
    template = alias(template);
    const inPlace = !appName || appName === '.';
    opts._inPlace = inPlace;
    // const name = inPlace ? path.relative('../', process.cwd()) : appName;
    const dest = path.resolve(appName || '.');

    const taskList = [
        {title: '🔍  检测目录和离线包状态...', task: checkStatus(template, dest, opts)},
        {title: '🚚 下载项目脚手架模板...', task: download(template, dest, opts)},
        {title: '🔨 生成项目目录结构...', task: generator(template, dest, opts)},
        {title: '🔗 安装项目依赖...', task: installDep(template, dest, opts)}
    ];

    // 离线脚手架目录处理
    // 1. 下载安装包 download
    // 2. 解包 unpack
    // 3. 安装 install
    // 4. 安装依赖 installDep
    // 5. 结束，显示问候语
    const tasks = new TaskList(taskList);
    tasks
        .run()
        .then(ctx => {
            const {metaData: opts, tplData: data} = ctx;
            if (typeof opts.complete === 'function') {
                // 跟 vue template 参数保持一致
                opts.complete(data, {
                    chalk,
                    logger: {
                        boxen,
                        log,
                        fatal: error,
                        success
                    },
                    files: []
                });
            } else {
                logMessage(opts.completeMessage, data);
            }
        })
        .catch(e => {
            error(e);
            process.exit(1);
        });
};

function prompt(input, done) {
    if (!Array.isArray(input)) {
        input = [input];
    }
    return new Promise((resolve, reject) => {
        inquirer(input, resolve);
    });
}

function logMessage(message, data) {
    if (Handlebars.isHandlebarTPL(message)) {
        render(message, data)
            .then(res => {
                // 显示
                log(res);
            })
            .catch(err => {
                error('\n   渲染完成信息失败：' + err.message.trim());
            });
    } else if (message) {
        log(message);
    }

    if (newVersion) {
        newVersionLog(localVersion, newVersion);
    }
}
function checkStatus(template, dest, opts) {
    return (ctx, task) => {
        return new Observable(async observer => {
            observer.next('开始检测目标目录状态');
            // 处理目标目录存在的情况，显示 loading 啊~
            delay(100)
                .then(async () => {
                    if (fs.existsSync(dest)) {
                        if (opts.force) {
                            observer.next('--force 删除目录');
                            return fs.remove(dest);
                        } else {
                            if (opts._inPlace) {
                                const {ok} = await prompt([
                                    {
                                        name: 'ok',
                                        type: 'confirm',
                                        message: '在当前目录创建项目？'
                                    }
                                ]);
                                if (!ok) {
                                    return;
                                }
                            } else {
                                observer.next();
                                const shortDest = path.relative(process.cwd(), dest);
                                const {action} = await inquirer.prompt([
                                    {
                                        name: 'action',
                                        type: 'list',
                                        message: `目录 ${chalk.cyan(shortDest)} 已经存在。请选择操作：`,
                                        choices: [
                                            {name: '覆盖', value: 'overwrite'},
                                            {name: '合并', value: 'merge'},
                                            {name: '取消', value: false}
                                        ]
                                    }
                                ]);
                                if (!action) {
                                    return;
                                } else if (action === 'overwrite') {
                                    observer.next(`选择覆盖，首先删除 ${shortDest}...`);
                                    await fs.remove(dest);
                                }
                            }
                        }
                    }
                })
                .then(() => {
                    observer.next('检测离线模板状态');
                    const isOffline = opts.offline;
                    if (isOffline || isLocalPath(template)) {
                        // 使用离线地址
                        // 直接复制，不下载 icode 代码
                        const templatePath = getTemplatePath(template);
                        if (fs.existsSync(templatePath)) {
                            // 添加 本地template 路径
                            ctx.localTemplatePath = templatePath;
                        } else {
                            observer.error('离线脚手架模板路径不存在');
                            return;
                        }
                    }
                    observer.complete();
                });
        });
    };
}

// 下载模板
function download(template, dest, opts) {
    return (ctx, task) => {
        return new Observable(observer => {
            // 临时存放地址，存放在~/.hulk-templates 下面
            let tmp = path.join(home, '.hulk-templates', template.replace(/[/:#]/g, '-'));
            if (opts.useCache && fs.exists(tmp)) {
                // 优先使用缓存
                task.skip('发现本地缓存，优先使用本地缓存模板');
                observer.complete();
            } else {
                observer.next('开始拉取模板');
                downloadRepo(template, tmp, opts)
                    .then(() => {
                        ctx.localTemplatePath = tmp;
                        observer.complete();
                    })
                    .catch(err => {
                        observer.error(
                            `拉取代码失败，请检查路径和代码权限是否正确\n使用「${chalk.bgYellow.black(
                                'DEBUG=hulk:*'
                            )}」查看报错信息`
                        );
                    });
                observer.complete();
            }
        });
    };
}
function installDep(template, dest, opts) {
    // 3. 安装依赖
    return (ctx, task) => {
        return new Observable(async observer => {
            const hasPackage = fs.exists(path.join(dest, 'package.json'));
            let install = hasPackage && opts.install;
            if (hasPackage && !install) {
                const name = 'install';
                const answers = await prompt([
                    {
                        type: 'confirm',
                        name,
                        message: '是否安装 npm 依赖'
                    }
                ]);
                if (answers[name]) {
                    install = true;
                }
            }

            if (install) {
                try {
                    // 清理 log，交给 npm
                    observer.next();
                    await installDeps(dest, opts.registry, true);
                    observer.complete();
                } catch (e) {
                    observer.error(e);
                }
            }
        });
    };
}
