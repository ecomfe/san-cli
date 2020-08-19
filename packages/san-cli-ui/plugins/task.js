/**
 * @file A UI Interface for CLI
 * @author jinzhan
 */
const path = require('path');
const fs = require('fs-extra');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const {processStats} = require('./utils/stats');

const debug = getDebugLogger('ui:third-plugin-task');

module.exports = api => {
    const sharedData = api.getSharedData('san.cli.');
    const ipc = api.getIpc();
    let firstRun = true;
    let hadFailed = false;

    const fields = {
        status: null,
        progress: {},
        operations: null,
        sizes: null,
        problems: null,
        url: null
    };

    const commonFields = {
        'modern-mode': false
    };

    api.onProjectOpen(setup);
    api.onPluginReload(setup);

    function setup() {
        for (const key of ['serve', 'build', 'build-modern']) {
            resetSharedData(key);
        }
        setupCommonData();
    }

    // Called when opening a project
    function setupCommonData() {
        // eslint-disable-next-line guard-for-in
        for (const field in commonFields) {
            sharedData.set(field, getSharedDataInitialValue(field, commonFields[field]));
        }
    }

    function resetSharedData(mode, clear = false) {
        // eslint-disable-next-line guard-for-in
        for (const field in fields) {
            const id = `${mode}-${field}`;
            sharedData.set(id, getSharedDataInitialValue(id, fields[field], clear));
        }
    }

    function getSharedDataInitialValue(id, defaultValue, clear) {
        if (!clear) {
            const data = sharedData.get(id);
            if (data != null) {
                return data.value;
            }
        }
        return defaultValue;
    }

    async function onWebpackMessage({data: message}) {
        debug('onWebpackMessage:', message);
        if (!message || !message.webpackDashboardData) {
            return;
        }

        const modernMode = sharedData.get('modern-mode') && sharedData.get('modern-mode').value;
        const type = message.webpackDashboardData.type;
        for (const data of message.webpackDashboardData.value) {
            const id = `${type}-${data.type}`;
            if (data.type === 'stats') {
                // Stats are read from a file
                const statsFile = path.resolve(api.getCwd(), `./node_modules/.stats-${type}.json`);
                const value = await fs.readJson(statsFile);
                const {stats, analyzer} = processStats(value);
                sharedData.set(id, stats, {
                    disk: true
                });
                sharedData.set(`${id}-analyzer`, analyzer, {
                    disk: true
                });
                await fs.remove(statsFile);
            }
            else if (data.type === 'progress') {
                if (type === 'serve' || !modernMode) {
                    sharedData.set(id, {
                        [type]: data.value
                    });
                }
                else {
                    // Display two progress bars
                    const progress = sharedData.get(id).value;
                    progress[type] = data.value;
                    for (const t of ['build', 'build-modern']) {
                        sharedData.set(`${t}-${data.type}`, {
                            'build': progress.build || 0,
                            'build-modern': progress['build-modern'] || 0
                        });
                    }
                }
            }
            else {
                // Don't display success until both build and build-modern are done
                if (type !== 'serve' && modernMode && data.type === 'status' && data.value === 'Success') {
                    if (type === 'build-modern') {
                        for (const t of ['build', 'build-modern']) {
                            sharedData.set(`${t}-status`, data.value);
                        }
                    }
                }
                else {
                    sharedData.set(id, data.value);
                }

                // Notifications
                if (type === 'serve' && data.type === 'status') {
                    if (data.value === 'Failed') {
                        api.notify({
                            title: 'Build failed',
                            message: 'The build has errors.',
                            icon: 'error'
                        });
                        hadFailed = true;
                    }
                    else if (data.value === 'Success') {
                        if (hadFailed) {
                            api.notify({
                                title: 'Build fixed',
                                message: 'The build succeeded.',
                                icon: 'done'
                            });
                            hadFailed = false;
                        }
                        else if (firstRun) {
                            api.notify({
                                title: 'App ready',
                                message: 'The build succeeded.',
                                icon: 'done'
                            });
                            firstRun = false;
                        }
                    }
                }
            }
        }
    }

    // 定义任务视图的一些信息
    const views = {
        views: [
            {
                id: 'san.san-cli.views.dashboard',
                label: 'san.san-cli.dashboard.title',
                icon: 'dashboard',
                component: 'san-cli.components.dashboard'
            },
            {
                id: 'san.san-cli.views.analyzer',
                label: 'san.san-cli.analyzer.title',
                icon: 'donut_large',
                component: 'san.san-cli.components.analyzer'
            }
        ],
        defaultView: 'san.san-cli.views.dashboard'
    };

    /**
     * 添加一个任务（San CLI的serve）
     * 1. 定义的这个task没有名称，表明这个task是个装饰性task，根据match匹配；
     *    注：装饰性的task不会出现在task的列表中，只会给要装饰的task添加额外的视图
     * 2. 包含views属性，表明这个task会添加视图；
     * 3. views数组size为2，表明将要添加2个视图；
     */
    api.registerTask({
        // 匹配san serve 或者 测试地址：san-cli/index.js serve
        match: /san(-cli\/index\.js)? serve(\s+--\S+(\s+\S+)?)*$/,
        description: 'san.san-cli.tasks.serve.description',
        link: 'https://ecomfe.github.io/san-cli',
        icon: '/public/san.svg',
        prompts: [
            {
                name: 'open',
                type: 'confirm',
                default: false,
                description: 'san.san-cli.tasks.serve.open'
            },
            {
                name: 'mode',
                type: 'list',
                default: 'development',
                choices: [
                    {
                        name: 'development',
                        value: 'development'
                    },
                    {
                        name: 'production',
                        value: 'production'
                    },
                    {
                        name: 'test',
                        value: 'test'
                    },
                    {
                        name: '(unset)',
                        value: ''
                    }
                ],
                description: 'san.san-cli.tasks.serve.mode'
            },
            {
                name: 'host',
                type: 'input',
                default: '',
                description: 'san.san-cli.tasks.serve.host'
            },
            {
                name: 'port',
                type: 'input',
                default: undefined,
                description: 'san.san-cli.tasks.serve.port'
            },
            {
                name: 'https',
                type: 'confirm',
                default: false,
                description: 'san.san-cli.tasks.serve.https'
            }
        ],
        onBeforeRun: ({answers, args}) => {
            if (answers.open) {
                args.push('--open');
            }

            if (answers.mode) {
                args.push('--mode', answers.mode);
            }

            if (answers.host) {
                args.push('--host', answers.host);
            }

            if (answers.port) {
                args.push('--port', answers.port);
            }

            if (answers.https) {
                args.push('--https');
            }

            args.push('--dashboard');

            resetSharedData('serve', true);
            firstRun = true;
            hadFailed = false;
        },
        onRun: () => {
            ipc.on(onWebpackMessage);
        },
        onExit: () => {
            ipc.off(onWebpackMessage);
            sharedData.remove('serve-url');
        },
        ...views
    });

    /**
     * 添加San CLI的build任务
     * 该任务添加2个视图
    */
    0 && api.registerTask({
        match: /san-cli-service build(\s+--\S+(\s+\S+)?)*$/,
        description: 'san.san-cli.tasks.build.description',
        link: 'https://ecomfe.github.io/san-cli',
        icon: '/public/san.svg',
        prompts: [
            {
                name: 'modern',
                type: 'confirm',
                default: false,
                message: 'san.san-cli.tasks.build.modern.label',
                description: 'san.san-cli.tasks.build.modern.description',
                link: 'https://ecomfe.github.io/san-cli'
            },
            {
                name: 'mode',
                type: 'list',
                default: 'production',
                choices: [
                    {
                        name: 'development',
                        value: 'development'
                    },
                    {
                        name: 'production',
                        value: 'production'
                    },
                    {
                        name: 'test',
                        value: 'test'
                    },
                    {
                        name: '(unset)',
                        value: ''
                    }
                ],
                description: 'san.san-cli.tasks.build.mode'
            },
            {
                name: 'dest',
                type: 'input',
                default: 'dist',
                description: 'san.san-cli.tasks.build.dest'
            },
            {
                name: 'target',
                type: 'list',
                default: 'app',
                choices: [
                    {
                        name: 'san.san-cli.tasks.build.target.app',
                        value: 'app'
                    },
                    {
                        name: 'san.san-cli.tasks.build.target.lib',
                        value: 'lib'
                    },
                    {
                        name: 'san.san-cli.tasks.build.target.wc',
                        value: 'wc'
                    },
                    {
                        name: 'san.san-cli.tasks.build.target.wc-async',
                        value: 'wc-async'
                    }
                ],
                description: 'san.san-cli.tasks.build.target.description'
            },
            {
                name: 'name',
                type: 'input',
                default: '',
                description: 'san.san-cli.tasks.build.name'
            },
            {
                name: 'watch',
                type: 'confirm',
                default: false,
                description: 'san.san-cli.tasks.build.watch'
            }
        ],
        onBeforeRun: ({answers, args}) => {
            if (answers.mode) {
                args.push('--mode', answers.mode);
            }

            if (answers.dest) {
                args.push('--dest', answers.dest);
            }

            if (answers.target) {
                args.push('--target', answers.target);
            }

            if (answers.name) {
                args.push('--name', answers.name);
            }

            if (answers.watch) {
                args.push('--watch');
            }

            if (answers.modern) {
                args.push('--modern');
            }

            sharedData.set('modern-mode', !!answers.modern);
            args.push('--dashboard');

            // Data
            resetSharedData('build', true);
            resetSharedData('build-modern', true);
        },
        onRun: () => {
            ipc.on(onWebpackMessage);
        },
        onExit: () => {
            ipc.off(onWebpackMessage);
        },
        ...views
    });

    /**
     * 添加San CLI的inspect任务
     * 该任务不增加视图
    */
    0 && api.registerTask({
        name: 'inspect',
        command: 'san-cli-service inspect',
        description: 'san.san-cli.tasks.inspect.description',
        link: 'https://ecomfe.github.io/san-cli',
        icon: '/public/san.svg',
        prompts: [
            {
                name: 'mode',
                type: 'list',
                default: 'production',
                choices: [
                    {
                        name: 'development',
                        value: 'development'
                    },
                    {
                        name: 'production',
                        value: 'production'
                    },
                    {
                        name: 'test',
                        value: 'test'
                    },
                    {
                        name: '(unset)',
                        value: ''
                    }
                ],
                description: 'san.san-cli.tasks.inspect.mode'
            },
            {
                name: 'verbose',
                type: 'confirm',
                default: false,
                description: 'san.san-cli.tasks.inspect.verbose'
            }
        ],
        onBeforeRun: ({answers, args}) => {
            if (answers.mode) {
                args.push('--mode', answers.mode);
            }

            if (answers.verbose) {
                args.push('--verbose');
            }

        }
    });

    if (process.env.SAN_CLI_UI_DEV) {
        api.registerAddon({
            id: 'san.san-cli.client-addon.dev',
            url: 'http://localhost:8951/index.js'
        });
    }
    else {
        api.registerClientAddon({
            id: 'san.san-cli.client-addon',
            path: 'san-cli-ui-addon-webpack/dist'
        });
    }

    // 打开本地页面链接
    ipc.on(({data}) => {
        if (data.sanCliServe) {
            sharedData.set('serve-url', data.sanCliServe.url);
        }
    });
};