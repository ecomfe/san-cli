/**
 * @file widgets
 * @author zttonly
 */

module.exports = api => {
    let {registerWidget} = api.namespace('san.widgets.');

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
        title: 'widgets.welcome.title',
        description: 'widgets.welcome.description',
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
        title: 'widgets.kill-port.title',
        description: 'widgets.kill-port.description',
        icon: 'thunderbolt',
        component: 'san.widgets.components.kill-port',
        minWidth: 2,
        minHeight: 1,
        maxWidth: 2,
        maxHeight: 1,
        maxCount: 1
    });


    // Plugin updates

    registerWidget({
        id: 'plugin-updates',
        title: 'widgets.plugin-updates.title',
        description: 'widgets.plugin-updates.description',
        icon: 'build',
        component: 'san.widgets.components.plugin-updates',
        minWidth: 2,
        minHeight: 1,
        maxWidth: 2,
        maxHeight: 1,
        maxCount: 1
    });

    // Dependency updates

    registerWidget({
        id: 'dependency-updates',
        title: 'widgets.dependency-updates.title',
        description: 'widgets.dependency-updates.description',
        icon: 'cluster',
        component: 'widgets.components.dependency-updates',
        minWidth: 2,
        minHeight: 1,
        maxWidth: 2,
        maxHeight: 1,
        maxCount: 1
    });

    // Vulnerability check

    registerWidget({
        id: 'vulnerability',
        title: 'widgets.vulnerability.title',
        description: 'widgets.vulnerability.description',
        icon: 'safety-certificate',
        component: 'san.widgets.components.vulnerability',
        detailsComponent: 'san.widgets.components.vulnerability-details',
        minWidth: 2,
        minHeight: 1,
        maxWidth: 2,
        maxHeight: 1,
        maxCount: 1
    });

    // Run task

    registerWidget({
        id: 'run-task',
        title: 'widgets.run-task.title',
        description: 'widgets.run-task.description',
        icon: 'schedule',
        component: 'widgets.components.run-task',
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
                    message: 'widgets.run-task.prompts.task',
                    choices: (await tasks.list(undefined, context)).map(task => ({
                        name: task.name,
                        value: task.id
                    }))
                }]
            };
        }
    });

    // News

    registerWidget({
        id: 'news',
        title: 'widgets.news.title',
        description: 'widgets.news.description',
        icon: 'info-circle',
        component: 'san.widgets.components.news',
        detailsComponent: 'san.widgets.components.news',
        minWidth: 2,
        minHeight: 1,
        maxWidth: 6,
        maxHeight: 6,
        defaultWidth: 2,
        defaultHeight: 3,
        openDetailsButton: true,
        defaultConfig: () => ({
            url: 'https://vuenews.fireside.fm/rss'
        }),
        async onConfigOpen() {
            return {
                prompts: [
                    {
                        name: 'url',
                        type: 'input',
                        message: 'org.vue.widgets.news.prompts.url',
                        validate: input => !!input
                    }
                ]
            };
        }
    });
};
