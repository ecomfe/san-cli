/**
 * @file widgets
 * @author zttonly
 */

module.exports = api => {
    if (process.env.SAN_CLI_UI_DEV) {
        api.registerAddon({
            id: 'san.widgets.client-addon.dev',
            url: 'http://localhost:8889/index.js'
        });
    }
    else {
        api.registerClientAddon({
            id: 'san.widgets.client-addon',
            path: 'san-cli-ui-addon-widgets/dist'
        });
    }

    // Welcome widget

    api.registerWidget({
        id: 'san.widgets.welcome',
        title: 'dashboard.widgets.welcome.title',
        description: 'dashboard.widgets.welcome.description',
        icon: 'smile',
        component: 'san.widgets.components.welcome',
        minWidth: 3,
        minHeight: 4,
        maxWidth: 3,
        maxHeight: 4,
        maxCount: 1
    });

    // Kill port widget
    api.registerWidget({
        id: 'san.widgets.kill-port',
        title: 'dashboard.widgets.kill-port.title',
        description: 'dashboard.widgets.kill-port.description',
        icon: 'thunderbolt',
        component: 'san.widgets.components.kill-port',
        minWidth: 2,
        minHeight: 1,
        maxWidth: 2,
        maxHeight: 1,
        maxCount: 1
    });

    // setSharedData('kill-port.status', 'idle');
    api.onAction('san.widgets.actions.kill-port', async params => {
        const fkill = require('fkill');
        let res = 'killing';
        // setSharedData('kill-port.status', 'killing')
        try {
            await fkill(`:${params.port}`);
            // setSharedData('kill-port.status', 'killed')
            res = 'killed';
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
            // setSharedData('kill-port.status', 'error')
            res = 'error';
        }
        return {
            status: res
        };
    });


    // Plugin updates

    // registerWidget({
    //     id: 'plugin-updates',
    //     title: 'dashboard.widgets.plugin-updates.title',
    //     description: 'dashboard.widgets.plugin-updates.description',
    //     icon: 'build',
    //     component: 'san.widgets.components.plugin-updates',
    //     minWidth: 2,
    //     minHeight: 1,
    //     maxWidth: 2,
    //     maxHeight: 1,
    //     maxCount: 1
    // });

    // Dependency updates

    // registerWidget({
    //     id: 'dependency-updates',
    //     title: 'dashboard.widgets.dependency-updates.title',
    //     description: 'dashboard.widgets.dependency-updates.description',
    //     icon: 'cluster',
    //     component: 'widgets.components.dependency-updates',
    //     minWidth: 2,
    //     minHeight: 1,
    //     maxWidth: 2,
    //     maxHeight: 1,
    //     maxCount: 1
    // });

    // Vulnerability check

    // registerWidget({
    //     id: 'vulnerability',
    //     title: 'dashboard.widgets.vulnerability.title',
    //     description: 'dashboard.widgets.vulnerability.description',
    //     icon: 'safety-certificate',
    //     component: 'san.widgets.components.vulnerability',
    //     detailsComponent: 'san.widgets.components.vulnerability-details',
    //     minWidth: 2,
    //     minHeight: 1,
    //     maxWidth: 2,
    //     maxHeight: 1,
    //     maxCount: 1
    // });

    // Run task

    api.registerWidget({
        id: 'san.widgets.run-task',
        title: 'dashboard.widgets.run-task.title',
        description: 'dashboard.widgets.run-task.description',
        icon: 'schedule',
        component: 'san.widgets.components.run-task',
        minWidth: 2,
        minHeight: 1,
        maxWidth: 2,
        maxHeight: 1,
        needsUserConfig: true,
        async onConfigOpen({context}) {
            const tasks = require('san-cli-ui/server/connectors/tasks');
            return {
                prompts: [{
                    name: 'task',
                    type: 'list',
                    message: 'dashboard.widgets.run-task.prompts.task',
                    placeholder: 'dashboard.widgets.run-task.prompts.placeholder',
                    choices: (await tasks.getTasks(undefined, context)).map(task => ({
                        name: task.name,
                        value: task.name
                    }))
                }]
            };
        }
    });

    // News
    api.registerWidget({
        id: 'san.widgets.news',
        title: 'dashboard.widgets.news.title',
        description: 'dashboard.widgets.news.description',
        icon: 'info-circle',
        component: 'san.widgets.components.news',
        minWidth: 6,
        minHeight: 1,
        maxWidth: 6,
        maxHeight: 6,
        defaultWidth: 5,
        defaultHeight: 2,
        openDetailsButton: false,
        defaultConfig: () => ({
            url: 'https://ecomfe.github.io/atom.xml'
        }),
        async onConfigOpen() {
            return {
                prompts: [
                    {
                        name: 'url',
                        type: 'input',
                        message: 'dashboard.widgets.news.prompts.url',
                        validate: input => !!input
                    }
                ]
            };
        }
    });

    const newsCache = global['san.newsCache'] = global['san.newsCache'] || {};
    let parser;

    api.onAction('san.widgets.actions.fetch-news', async params => {
        if (!parser) {
            const Parser = require('rss-parser');
            parser = new Parser();
        }

        if (!params.force) {
            const cached = newsCache[params.url];
            if (cached) {
                return cached;
            }
        }

        let url = params.url;
        // GitHub repo
        if (url.match(/^[\w_.-]+\/[\w_.-]+$/)) {
            url = `https://github.com/${url}/releases.atom`;
        }

        const result = await parser.parseURL(url);
        newsCache[params.url] = result;
        return result;
    });

    api.registerWidget({
        id: 'san.widgets.gen-qrcode',
        title: 'dashboard.widgets.gen-qrcode.title',
        description: 'dashboard.widgets.gen-qrcode.description',
        icon: 'qrcode',
        component: 'san.widgets.components.gen-qrcode',
        minWidth: 2,
        minHeight: 3,
        maxWidth: 2,
        maxHeight: 3,
        maxCount: 1,
        async onConfigOpen() {
            return {
                prompts: [
                    {
                        name: 'from',
                        type: 'input',
                        message: 'dashboard.widgets.gen-qrcode.prompts.from',
                        placeholder: 'dashboard.widgets.run-task.prompts.needless',
                        validate: input => !!input
                    },
                    {
                        name: 'page',
                        type: 'input',
                        message: 'dashboard.widgets.gen-qrcode.prompts.page',
                        placeholder: 'dashboard.widgets.run-task.prompts.needless',
                        validate: input => !!input
                    },
                    {
                        name: 'type',
                        type: 'input',
                        message: 'dashboard.widgets.gen-qrcode.prompts.type',
                        placeholder: 'dashboard.widgets.run-task.prompts.needless',
                        validate: input => !!input
                    },
                    {
                        name: 'extra',
                        type: 'input',
                        message: 'dashboard.widgets.gen-qrcode.prompts.extra',
                        placeholder: 'dashboard.widgets.run-task.prompts.needless',
                        validate: input => !!input
                    }
                ]
            };
        }
    });
};
