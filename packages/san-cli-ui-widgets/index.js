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
        api.registerAddon({
            id: 'san.widgets.client-addon',
            path: 'san-cli-ui-widgets/dist'
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
        minWidth: 5,
        minHeight: 1,
        maxWidth: 5,
        maxHeight: 6,
        defaultWidth: 5,
        defaultHeight: 4,
        openDetailsButton: true,
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
                        validate: input => !!input,
                        formItemLayout: {
                            labelCol: {
                                xs: {
                                    span: 12
                                },
                                sm: {
                                    span: 10
                                }
                            },
                            wrapperCol: {
                                xs: {
                                    span: 8
                                },
                                sm: {
                                    span: 14
                                }
                            }
                        }
                    }
                ]
            };
        }
    });

    const newsCache = global['san.newsCache'] = global['san.newsCache'] || {};
    let parser;

    api.onAction('san.widgets.actions.fetch-news', async params => {
        if (!params.force) {
            const cached = newsCache[params.url];
            if (cached) {
                return cached;
            }
        }

        let result;
        if (params.url.indexOf('zhuanlan.zhihu.com') !== -1) {
            const {data = []} = await require('node-fetch')(
                params.url.replace('zhuanlan.zhihu.com', 'www.zhihu.com/api/v4/columns') + '/items'
            ).then(res => res.json());
            result = {
                items: data.map(item => {
                    const {title, content, excerpt, created, url, created_time, question, id} = item;
                    return {
                        title: title || question.title,
                        content,
                        contentSnippet: excerpt,
                        pubDate: created || created_time,
                        link: url || `https://www.zhihu.com/question/${question.id}/answer/${id}`
                    };
                })
            };
        } else {
            if (!parser) {
                const Parser = require('rss-parser');
                parser = new Parser();
            }

            let url = params.url;
            // GitHub repo
            if (url.match(/^[\w_.-]+\/[\w_.-]+$/)) {
                url = `https://github.com/${url}/releases.atom`;
            }

            result = await parser.parseURL(url);
        }

        newsCache[params.url] = result;
        return result;
    });

};
