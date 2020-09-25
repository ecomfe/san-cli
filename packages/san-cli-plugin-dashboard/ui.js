/**
 * @file A UI Interface for CLI
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/ui-defaults/tasks.js
 * Modified by jinzhan
 */
const path = require('path');
const fs = require('fs-extra');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const {processStats} = require('./lib/stats');

let sanIcon = '/public/san.svg';
if (process.env.SAN_CLI_UI_DEV) {
    sanIcon = `http://localhost:${process.env.SAN_APP_GRAPHQL_PORT}` + sanIcon;
}
const debug = getDebugLogger('ui:third-plugin-dashboard');

module.exports = api => {
    // 加了一个san.cli的命名空间
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
            const value = getSharedDataInitialValue(field, commonFields[field]);
            sharedData.set(field, value);
            debug('setupCommonData:', JSON.stringify({field, value}, null, '\t'));
        }
    }

    function resetSharedData(mode, clear = false) {
        // eslint-disable-next-line guard-for-in
        for (const field in fields) {
            const id = `${mode}-${field}`;
            const value = getSharedDataInitialValue(id, fields[field], clear);
            sharedData.set(id, value);
            debug('resetSharedData:', JSON.stringify({id, value}, null, '\t'));
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
        // 获取cli-plugin-dashboard传输过来的数据
        if (!message || !message.webpackDashboardData) {
            return;
        }

        const modernMode = sharedData.get('modern-mode') && sharedData.get('modern-mode').value;

        // 编译的类型，这里就是serve或build
        const type = message.webpackDashboardData.type;
        for (const data of message.webpackDashboardData.value) {
            // 数据的类型：status/progress/operations/stats
            const id = `${type}-${data.type}`;
            // 获得了stats类型数据，代表传输完成了
            if (data.type === 'stats') {
                // 从文件中读取stats数据
                const statsFile = path.resolve(api.getCwd(), `./node_modules/.stats-${type}.json`);
                if (!fs.existsSync(statsFile)) {
                    debug(`File [${statsFile}] does not exist`);
                    return;
                }
                const value = await fs.readJson(statsFile);
                const {stats, analyzer} = processStats(value);
                // TODO: 优化analyzer数据的处理
                sharedData.set(id, stats, {
                    disk: true
                });

                // 清除stats临时文件
                await fs.remove(statsFile);

                const statsRawFile = path.resolve(api.getCwd(), `./node_modules/.stats-${type}-raw.json`);
                if (!fs.existsSync(statsRawFile)) {
                    debug(`Raw file [${statsRawFile}] does not exist`);
                }
                else {
                    const analyzerData = await fs.readJson(statsRawFile);
                    sharedData.set(`${id}-analyzer`, analyzerData, {
                        disk: true
                    });
                    await fs.remove(statsRawFile);
                }
            }
            else if (data.type === 'progress') {
                if (type === 'serve' || !modernMode) {
                    sharedData.set(id, {
                        [type]: data.value
                    });
                }
                else {
                    // build的modernMode下提供2组数局
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
                id: 'san.cli-ui.views.dashboard',
                label: 'addons.dashboard.title',
                component: 'san.cli-ui.components.dashboard'
            },
            {
                id: 'san.cli-ui.views.analyzer',
                label: 'addons.analyzer.title',
                component: 'san.cli-ui.components.analyzer'
            }
        ],
        defaultView: 'san.cli-ui.views.dashboard'
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
        description: 'task.description.serve',
        link: 'https://ecomfe.github.io/san-cli',
        icon: sanIcon,
        prompts: [
            {
                name: 'open',
                type: 'confirm',
                default: false,
                message: 'task.serve.open'
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
                        name: '(unset)',
                        value: ''
                    }
                ],
                message: 'task.serve.mode'
            },
            {
                name: 'host',
                type: 'input',
                default: '0.0.0.0',
                message: 'task.serve.host'
            },
            {
                name: 'port',
                type: 'input',
                default: undefined,
                message: 'task.serve.port'
            },
            {
                name: 'https',
                type: 'confirm',
                default: false,
                message: 'task.serve.https'
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
    api.registerTask({
        // 匹配san build 或者 测试地址：san-cli/index.js build
        match: /san(-cli\/index\.js)? build(\s+--\S+(\s+\S+)?)*$/,
        description: 'task.description.build',
        link: 'https://ecomfe.github.io/san-cli',
        icon: sanIcon,
        prompts: [
            {
                name: 'modern',
                type: 'confirm',
                default: false,
                message: 'task.build.modern.label',
                description: 'task.build.modern.description',
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
                        name: '(unset)',
                        value: ''
                    }
                ],
                message: 'task.build.mode'
            },
            {
                name: 'dest',
                type: 'input',
                default: 'dist',
                message: 'task.build.dest'
            },
            {
                name: 'watch',
                type: 'confirm',
                default: false,
                message: 'task.build.watch'
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
     * 添加San CLI的inspect内置任务
     * 该任务不增加视图
    */
    api.registerTask({
        name: 'inspect',
        command: 'san-cli-service inspect',
        description: 'task.description.inspect',
        link: 'https://ecomfe.github.io/san-cli',
        icon: sanIcon,
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
                description: 'task.inspect.mode'
            },
            {
                name: 'verbose',
                type: 'confirm',
                default: false,
                description: 'task.inspect.verbose'
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
        api.registerAddon({
            id: 'san.san-cli.client-addon',
            path: 'san-cli-plugin-dashboard/dist'
        });
    }

    // TODO: 添加本地页面链接
    ipc.on(({data}) => {
        if (data.sanCliServe) {
            sharedData.set('serve-url', data.sanCliServe.url);
        }
    });
};
