/**
 * @file init 初始化项目
 */
const path = require('path');

const fs = require('fs-extra');
const chalk = require('chalk');
const home = require('user-home');
const boxen = require('boxen');

const Observable = require('rxjs').Observable;
const semver = require('semver');
const render = require('consolidate').handlebars.render;

const inquirer = require('@baidu/hulk-utils/listr/inquirer');
const listr = require('@baidu/hulk-utils/listr');
const Handlebars = require('../../lib/handlerbars');
const generator = require('../../lib/generator');
const {name, version: localVersion} = require('../../package.json');
const {log, success, error, clearConsole, newVersionLog} = require('@baidu/hulk-utils/logger');
const {getLatestVersion} = require('@baidu/hulk-utils/get-latest-version');
const {isLocalPath, getTemplatePath, downloadRepo, installDeps} = require('@baidu/hulk-utils');

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
getLatestVersion().then(latest => {
    if (semver.lt(localVersion, latest)) {
        newVersion = latest;
    }
});

module.exports = async (template, appName, opts) => {
    template = alias(template);
    const inPlace = !appName || appName === '.';
    const name = inPlace ? path.relative('../', process.cwd()) : appName;
    const dest = path.resolve(appName || '.');
    const task = listr([
        {
            title: '检测目标目录状态',
            task: ctx => {
                return new Observable(async observer => {
                    observer.next('是否为空目录');
                    // 处理目标目录存在的情况
                    if (fs.existsSync(dest)) {
                        if (opts.force) {
                            observer.next('--force 删除目录');
                            await fs.remove(dest);
                        } else {
                            if (inPlace) {
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
                                const {action} = await prompt([
                                    {
                                        name: 'action',
                                        type: 'list',
                                        message: `目录 ${chalk.cyan(dest)} 已经存在。请选择操作：`,
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
                                    observer.next(`选择覆盖，首先删除 ${dest}...`);
                                    await fs.remove(dest);
                                }
                            }
                        }
                    }
                    observer.complete();
                });
            }
        }
    ]);

    task.run()
        .then(ctx => {
            success('成功');
        })
        .catch(e => {
            error(e);
        });

    return;
    // 离线脚手架目录处理
    // 1. 下载安装包 download
    // 2. 解包 unpack
    // 3. 安装 install
    // 4. 安装依赖 installDep
    // 5. 结束，显示问候语
    const tasks = Listr([
        {
            title: '🔍 分析命令...',
            task: ctx => {
                console.log(ctx);
                return Promise.resolve(111);
            }
        },
        {
            title: '🚚 下载项目脚手架模板...',
            // 遇见本地和 usecache 就跳过
            skip: ctx => ctx.useOffline || ctx.useCache,
            task: ctx => {
                console.log(ctx);
            }
        },
        {
            title: '🔨 生成项目',
            task: () => {
                return Promise.reject(new Error('1212'));
            }
        },
        {
            title: '🔗 安装依赖',
            task: ctx => {
                console.log(ctx);
            }
        }
    ]);
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
        .catch(reason => {
            console.log(reason);
            process.exit(1);
        });
    function analyze(ctx) {
        return new Promise((resolve, reject) => {
            const isOffline = opts.offline;
            ctx.useCache = opts.useCache;
            if (isOffline || isLocalPath(template)) {
                // 使用离线地址
                // 直接复制，不下载 icode 代码
                const templatePath = getTemplatePath(template);
                if (exists(templatePath)) {
                    ctx.useOffline = true;
                    // 添加 本地template 路径
                    ctx.localTemplatePath = templatePath;
                    // resolve();
                    setTimeout(() => {
                        console.log(ctx);
                        resolve();
                    }, 1000);
                } else {
                    reject('离线脚手架模板路径不存在');
                }
            }
        });
    }
    // 下载模板
    function download(ctx) {
        return new Promise((resolve, reject) => {
            // 临时存放地址，存放在~/.hulk-templates 下面
            let tmp = path.join(home, '.hulk-templates', template.replace(/[/:#]/g, '-'));
            if (opts.useCache && exists(tmp)) {
                // 优先使用缓存
                tasks.skip('发现本地缓存，优先使用本地缓存模板');
                resolve();
            } else {
                downloadRepo(template, tmp, opts)
                    .then(() => {
                        ctx.localTemplatePath = tmp;
                        resolve();
                    })
                    .catch(err => {
                        reject(
                            `拉取代码失败，请检查路径和代码权限是否正确\n使用「${chalk.bgYellow.black(
                                'DEBUG=hulk:*'
                            )}」查看报错信息`
                        );
                    });
            }
        });
    }
    function installDep(ctx) {
        // 3. 安装依赖
        return new Promise(async (resolve, reject) => {
            const hasPackage = exists(path.join(dest, 'package.json'));
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
                    await installDeps(dest, opts.registry, true);
                } catch (e) {
                    reject(e);
                }
            }
        });
    }
    function generate(ctx) {
        return generator(name, ctx.localTemplatePath, dest, ctx);
    }
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
