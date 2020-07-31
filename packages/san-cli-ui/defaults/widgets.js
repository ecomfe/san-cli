/**
 * @file widgets
 * @author zttonly
 */

module.exports = api => {
    let {registerWidget, onAction} = api.namespace('san.widgets.');

    if (process.env.SAN_CLI_UI_DEV) {
        api.addClientAddon({
            id: 'san.widgets.client-addon.dev',
            url: 'http://localhost:8889/index.js'
        });
    }
    else {
        api.addClientAddon({
            id: 'san.widgets.client-addon',
            path: 'san-cli-ui-addon-widgets/dist'
        });
    }

    // Welcome widget

    registerWidget({
        id: 'welcome',
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
    registerWidget({
        id: 'kill-port',
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
    onAction('actions.kill-port', async params => {
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

    // registerWidget({
    //     id: 'run-task',
    //     title: 'dashboard.widgets.run-task.title',
    //     description: 'dashboard.widgets.run-task.description',
    //     icon: 'schedule',
    //     component: 'widgets.components.run-task',
    //     minWidth: 2,
    //     minHeight: 1,
    //     maxWidth: 2,
    //     maxHeight: 1,
    //     needsUserConfig: true,
    //     async onConfigOpen({context}) {
    //         const tasks = require('san-cli-ui/server/connectors/tasks');
    //         return {
    //             prompts: [{
    //                 name: 'task',
    //                 type: 'list',
    //                 message: 'widgets.run-task.prompts.task',
    //                 choices: (await tasks.list(undefined, context)).map(task => ({
    //                     name: task.name,
    //                     value: task.id
    //                 }))
    //             }]
    //         };
    //     }
    // });

    // News

    registerWidget({
        id: 'news',
        title: 'dashboard.widgets.news.title',
        description: 'dashboard.widgets.news.description',
        icon: 'info-circle',
        component: 'san.widgets.components.news',
        minWidth: 2,
        minHeight: 1,
        maxWidth: 6,
        maxHeight: 6,
        defaultWidth: 2,
        defaultHeight: 3,
        openDetailsButton: false,
        defaultConfig: () => ({
            url: 'https://vuenews.fireside.fm/rss'
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

    onAction('actions.fetch-news', async params => {
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
};
