/**
 * @file index
 * @author zhangtingting12 <zhangtingting12@baidu.com>
 */

import san from 'san';
import {router} from 'san-router';
import {register} from '@lib/san-apollo';
import localization from '@lib/san-localization';
import createApolloServer from '@lib/createApolloServer';
import App from './app';
import ProjectSelect from './select';
import About from '@components/about';
import NotFound from '@components/not-found';

// eslint-disable-next-line no-undef
const graphqlEndpoint = APP_GRAPHQL_ENDPOINT || `ws://${location.host}/graphql`;
register(san, createApolloServer(graphqlEndpoint));

// add localization
localization(san);

const routes = [
    {rule: '/', Component: ProjectSelect, target: '#app'},
    {rule: '/home', Component: App, target: '#app'},
    {rule: '/about', Component: About, target: '#app'},
    {rule: '/project', Component: ProjectSelect, target: '#app'},
    {rule: '/project/:nav', Component: ProjectSelect, target: '#app'},
    {rule: '/notfound', Component: NotFound, target: '#app'}
];

routes.forEach(option => router.add(option));

router.listen((e, config) => {
    // eslint-disable-next-line no-console
    console.log(e);
});

router.start();
