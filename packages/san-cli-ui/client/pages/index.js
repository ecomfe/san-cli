/**
 * @file index
 * @author zttonly
 */

import san from 'san';
import {router} from 'san-router';
import ClientAddonApi from '../lib/utils/ClientAddonApi';
import createClient from '@lib/apollo-client';
import mixin from '@lib/san-mixin';
import localization from '@lib/localization';
// import eventBus from '@lib/event-bus';
import pluginAction from '@lib/plugin-action';
import Project from './project';
import Task from './task';
import About from '@components/about';
import NotFound from '@components/not-found';
import Dependency from './dependency';
import Configuration from './configuration';
import Plugins from './plugins';
import Dashboard from './dashboard';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_CWD_RESET from '@graphql/project/projectCwdReset.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';
import './index.less';

// 调试模式使用package.json中定义的APP_GRAPHQL_ENDPOINT
// eslint-disable-next-line no-undef
const graphqlEndpoint = APP_GRAPHQL_ENDPOINT || `ws://${location.host}/graphql`;

// 注入全局方法
mixin(san.Component, {
    // 导入语言包
    $t: localization,

    // TODO: 这里可以导入事件总线
    // ...eventBus

    // 导入插件回调方法
    ...pluginAction,

    // 导入$apollo对象
    $apollo: createClient(graphqlEndpoint),
});

window.ClientAddonApi = new ClientAddonApi();

const routes = [
    {rule: '/', Component: Project, target: '#app'},
    {rule: '/project', Component: Project, target: '#app'},
    {rule: '/project/:nav', Component: Project, target: '#app'},
    {rule: '/plugins', Component: Plugins, target: '#app'},
    {rule: '/dependency', Component: Dependency, target: '#app'},
    {rule: '/dashboard', Component: Dashboard, target: '#app', needProject: true},
    {rule: '/configuration', Component: Configuration, target: '#app', needProject: true},
    {rule: '/tasks', Component: Task, target: '#app'},
    {rule: '/tasks/:task', Component: Task, target: '#app'},
    {rule: '/about', Component: About, target: '#app'},
    {rule: '/:func', Component: NotFound, target: '#app'}
];

routes.forEach(option => router.add(option));

// 如果APP_GRAPHQL_ENDPOINT存在的话，代表是开发环境。
// 正式环境下使用html5模式
// eslint-disable-next-line no-undef
APP_GRAPHQL_ENDPOINT || router.setMode('html5');

// 初始化时首先校正当前project路径
const resetStatus = async () => {
    await san.Component.prototype.$apollo.mutate({
        mutation: PROJECT_CWD_RESET
    });
    // plugin初始化需要尽早调用
    await san.Component.prototype.$apollo.query({query: PLUGINS});
};

router.listen(async (e, config) => {
    // 此处的处理属于路由切换后，有些前置的操作需要在切换的函数中处理，例如project-list
    if (config.needProject) {
        const result = await san.Component.prototype.$apollo.query({
            query: PROJECT_CURRENT,
            fetchPolicy: 'network-only'
        });

        if (!result.data.projectCurrent) {
            router.locator.redirect('/');
            return;
        }
    }
});

resetStatus();
router.start();
