/**
 * @file 前端入口
 * @author zttonly, Lohoyo
 */

import {router} from 'san-router';
import apolloClient from '@lib/apollo-client';
import ClientAddon, {loadClientAddons} from '@lib/client-addon';
import Component from '@lib/san-component';
import NotFound from '@components/not-found';
import App from './app';
import Home from './home';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_CWD_RESET from '@graphql/project/projectCwdReset.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';
import UI_THEME from '@graphql/theme/theme.gql';

const app = {
    initClientAddons() {
        // 暴露全局API，用于集成第三方组件
        window.ClientAddonApi = new ClientAddon();
        window.SanComponent = Component;
        // 加载第三方组件
        loadClientAddons();
    },

    /**
     * @param {string} name 一级路由名字
     * @param {Array.<string>} 二级路由的列表
     *
     * @return {RegExp} 得到一个正则表达式，类似这种：/project/(dashboard|plugins|...)
    */
    getRouteRule(name, routeList) {
        return new RegExp(`^/${name}/(${routeList.join('|')})$`);
    },

    getHomeRoutes() {
        const homeRouteRule = this.getRouteRule('home', [
            'import',
            'create',
            'list'
        ]);
        return [
            {
                rule: '/',
                Component: Home,
                target: '#app'
            },
            {
                rule: '/home',
                Component: Home,
                target: '#app'
            },
            {
                rule: homeRouteRule,
                Component: Home,
                target: '#app'
            }
        ];
    },

    getProjectRoutes() {
        const projectRouteRule = this.getRouteRule('project', [
            'dashboard',
            'plugins',
            'dependency',
            'configuration',
            'task'
        ]);
        return [
            {
                rule: projectRouteRule,
                Component: App,
                target: '#app'
            },
            {
                rule: /^\/project\/(task)\/(.+)$/,
                Component: App,
                target: '#app'
            },
            // 自定义路由
            {
                rule: '/addon/:addon',
                Component: App,
                target: '#app'
            },
        ];
    },

    initRoutes() {
        const homeRoutes = this.getHomeRoutes();
        const projectRoutes = this.getProjectRoutes();
        const routes = [
            ...homeRoutes,
            ...projectRoutes,
            {
                rule: /.*/,
                Component: NotFound,
                target: '#app'
            }
        ];

        routes.forEach(option => router.add(option));

        // 如果APP_GRAPHQL_ENDPOINT存在的话，代表是开发环境。
        // 正式环境下使用html5模式
        // eslint-disable-next-line no-undef
        APP_GRAPHQL_ENDPOINT || router.setMode('html5');

        router.listen(async (e, config) => {
            await this.resetProjectCwd();

            // 此处的处理属于路由切换后，有些前置的操作需要在切换的函数中处理，例如project-list
            if (config.needProject) {
                const result = await apolloClient.query({
                    query: PROJECT_CURRENT,
                    fetchPolicy: 'network-only'
                });

                if (!result.data.projectCurrent) {
                    router.locator.redirect('/');
                    return;
                }
            }
        });
    },

    async resetProjectCwd() {
        // 只有匹配到了 ^/project/xxxx，才重置PROJECT_CWD
        if (router.locator.current.indexOf('/project/')) {
            return;
        }

        // 只重置一次
        if (this.$projectInited) {
            return;
        }

        this.$projectInited = true;

        await apolloClient.mutate({
            mutation: PROJECT_CWD_RESET
        });

        // plugin初始化需要尽早调用
        await apolloClient.query({query: PLUGINS});
    },

    async init() {
        this.initClientAddons();
        this.initRoutes();
        this.resetProjectCwd();
        router.start();

        const res = await apolloClient.query({query: UI_THEME});
        if (res && res.data && res.data.theme) {
            document.body.classList.add(res.data.theme);
        }
    }
};

app.init();
