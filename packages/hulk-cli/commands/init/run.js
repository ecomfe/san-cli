/**
 * @file init 初始化项目
 */
const path = require('path');
const importLazy = require('import-lazy')(require);

const fs = importLazy('fs-extra');
const chalk = importLazy('chalk');
const rxjs = importLazy('rxjs');
const consolidate = importLazy('consolidate');

const inquirer = importLazy('inquirer');
const execa = importLazy('execa');
const updateNotifier = importLazy('update-notifier');
const {name, version: localVersion} = require('../../package.json');

const {log, success, error} = require('@baidu/hulk-utils/logger');
const dRepo = importLazy('@baidu/hulk-utils/download-repo');
const {isLocalPath} = require('@baidu/hulk-utils/path');

const Handlebars = importLazy('../../lib/handlerbars');
const generator = importLazy('../../lib/generator');
// eslint-disable-next-line
const {NPM_REGISTRY} = require('../../constants');
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

module.exports = async (template, appName, opts) => {
    const TaskList = require('../../lib/TaskList');

    template = alias(template);
    const inPlace = !appName || appName === '.';
    opts._inPlace = inPlace;
    // const name = inPlace ? path.relative('../', process.cwd()) : appName;
    const dest = path.resolve(appName || '.');
    const startTime = Date.now();
    const taskList = [
        {title: '🔍 检测目录和离线包状态...', task: checkStatus(template, dest, opts)},
        {title: '🚚 下载项目脚手架模板...', task: download(template, dest, opts)},
        {title: '🔨 生成项目目录结构...', task: generator(template, dest, opts)},
        {title: '🔗 安装项目依赖...', task: installDep(template, dest, opts)}
    ];

    // 检测版本更新
    const notifier = updateNotifier({
        pkg: {
            name,
            version: localVersion
        },
        isGlobal: true,
        // updateCheckInterval: 0,
        // npm script 也显示
        shouldNotifyInNpmScript: true
    });
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
            const duration = (((Date.now() - startTime) / 10) | 0) / 100;
            console.log('✨  Done in ' + duration + 's.');

            if (typeof opts.complete === 'function') {
                // 传入参数
                opts.complete(data, {
                    chalk,
                    logger: {
                        boxen: require('boxen'),
                        log,
                        fatal: error,
                        success
                    },
                    files: []
                });
            } else {
                logMessage(opts.completeMessage, data);
            }

            notifier.notify();
        })
        .catch(e => {
            error(e);
            // info(`使用 ${chalk.yellow('DEBUG=hulk:*')} 查看报错信息`);

            process.exit(1);
        });
};

function prompt(input, done) {
    if (!Array.isArray(input)) {
        input = [input];
    }
    return inquirer.prompt(input);
}

function logMessage(message, data) {
    if (Handlebars.isHandlebarTPL(message)) {
        consolidate.handlebars
            .render(message, data)
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
}
function checkStatus(template, dest, opts) {
    return (ctx, task) => {
        return new rxjs.Observable(async observer => {
            observer.next('开始检测目标目录状态');
            // 处理目标目录存在的情况，显示 loading 啊~
            if (fs.existsSync(dest)) {
                if (opts.force) {
                    observer.next('--force 删除目录');
                    return fs.remove(dest);
                } else if (opts._inPlace) {
                    // eslint-disable-next-line
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
                    // eslint-disable-next-line
                    const {action} = await prompt([
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
                        return observer.error(`取消覆盖 ${shortDest} 文件夹`);
                    } else if (action === 'overwrite') {
                        observer.next(`选择覆盖，首先删除 ${shortDest}...`);
                        await fs.remove(dest);
                    }
                }
            }

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
                    return observer.error('离线脚手架模板路径不存在');
                }
            }
            observer.complete();
        });
    };
}

function getTemplatePath(template) {
    const home = require('user-home');
    return path.join(home, '.hulk-templates', template.replace(/[/:#]/g, '-'));
}

// 下载模板
function download(template, dest, opts) {
    return (ctx, task) => {
        return new rxjs.Observable(observer => {
            if (ctx.localTemplatePath) {
                // 使用本地路径
                task.skip('本次使用本地路径');
                observer.complete();
                return;
            }
            // 临时存放地址，存放在~/.hulk-templates 下面
            let tmp = getTemplatePath(template);
            if (opts.useCache && fs.exists(tmp)) {
                // 优先使用缓存
                task.skip('发现本地缓存，优先使用本地缓存模板');
                observer.complete();
            } else {
                observer.next('拉取模板ing...');
                dRepo
                    .downloadRepo(template, tmp, opts)
                    .then(() => {
                        ctx.localTemplatePath = tmp;
                        observer.complete();
                    })
                    .catch(err => {
                        observer.error('拉取代码失败，请检查路径和代码权限是否正确');
                    });
            }
        });
    };
}
function installDep(template, dest, opts) {
    // 3. 安装依赖
    return (ctx, task) => {
        return new rxjs.Observable(async observer => {
            const hasPackage = fs.exists(path.join(dest, 'package.json'));
            let install = hasPackage && opts.install;
            if (hasPackage && !install) {
                const name = 'install';
                observer.next();
                const answers = await prompt([
                    {
                        type: 'confirm',
                        name,
                        message: '是否安装 npm 依赖'
                    }
                ]);
                if (answers[name]) {
                    install = true;
                } else {
                    task.skip('用户选择不安装依赖');
                    observer.complete();
                    return;
                }
            }

            if (install) {
                try {
                    // 清理 log，交给 npm
                    observer.next('安装依赖ing...');
                    await installDeps(dest, opts.verbose, opts.registry);
                    observer.complete();
                } catch (e) {
                    observer.error(e);
                }
            }
        });
    };
}

function installDeps(dest, verbose = false, registry = NPM_REGISTRY) {
    return execa('npm', ['install', '--loglevel', 'error', '--registry', registry], {
        cwd: dest,
        stdio: verbose ? ['inherit', 'inherit', 'inherit'] : ['ignore', 'ignore', 'ignore']
    });
}
