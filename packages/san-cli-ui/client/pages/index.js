/**
 * @file index
 * @author zttonly
 */

import san from 'san';
import {router} from 'san-router';
import createApolloServer from '@lib/create-apollo-server';
import {register} from '@lib/san-apollo';
import localization from '@lib/san-localization';
import Project from './project';
import Task from './task';
import About from '@components/about';
import NotFound from '@components/not-found';
import Configuration from './configuration';

// eslint-disable-next-line no-undef
const graphqlEndpoint = APP_GRAPHQL_ENDPOINT || `ws://${location.host}/graphql`;

// add $apollo to San Components
register(san, createApolloServer(graphqlEndpoint));

// add localization
localization(san);

const routes = [
    {rule: '/', Component: Project, target: '#app'},
    {rule: '/project', Component: Project, target: '#app'},
    {rule: '/project/:nav', Component: Project, target: '#app'},
    {rule: '/about', Component: About, target: '#app'},
    {rule: '/configuration', Component: Configuration, target: '#app'},
    {rule: '/task', Component: Task, target: '#app'},
    {rule: '/:func', Component: NotFound, target: '#app'}
];

routes.forEach(option => router.add(option));

// 如果APP_GRAPHQL_ENDPOINT存在的话，代表是开发环境。
// 正式环境下使用html5模式
// eslint-disable-next-line no-undef
APP_GRAPHQL_ENDPOINT || router.setMode('html5');

router.listen((e, config) => {
    // eslint-disable-next-line no-console
    console.log(e);
});
router.start();
