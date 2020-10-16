/**
 * @file 前端入口
 * @author zttonly, Lohoyo
 */

import {router} from 'san-router';
import apolloClient from '@lib/apollo-client';
import ClientAddon, {loadClientAddons} from '@lib/client-addon';
import Component from '@lib/san-component';
import About from '@components/about';
import NotFound from '@components/not-found';
import App from './app';
import PROJECT_CURRENT from '@graphql/project/projectCurrent.gql';
import PROJECT_CWD_RESET from '@graphql/project/projectCwdReset.gql';
import PLUGINS from '@graphql/plugin/plugins.gql';

// 暴露全局API，用于集成第三方组件
window.ClientAddonApi = new ClientAddon();
window.SanComponent = Component;

// 加载第三方组件
loadClientAddons();

const routes = [
    {rule: '/', Component: App, target: '#app'},
    {rule: '/project', Component: App, target: '#app'},
    {rule: /^\/project\/(dashboard|plugins|dependency|configuration|task)$/, Component: App, target: '#app'},
    // TODO: 待优化
    {rule: /^\/project\/(task)\/(.+)$/, Component: App, target: '#app'},
    {rule: '/addon/:addon', Component: App, target: '#app'},
    {rule: '/about', Component: About, target: '#app'},
    {rule: /.*/, Component: NotFound, target: '#app'}
];

routes.forEach(option => router.add(option));

// 如果APP_GRAPHQL_ENDPOINT存在的话，代表是开发环境。
// 正式环境下使用html5模式
// eslint-disable-next-line no-undef
APP_GRAPHQL_ENDPOINT || router.setMode('html5');

// 初始化时首先校正当前project路径
const resetStatus = async () => {
    await apolloClient.mutate({
        mutation: PROJECT_CWD_RESET
    });
    // plugin初始化需要尽早调用
    await apolloClient.query({query: PLUGINS});
};

router.listen(async (e, config) => {
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

resetStatus();
router.start();
