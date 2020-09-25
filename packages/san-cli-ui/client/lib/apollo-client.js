/**
 * @file create ApolloClient
 * @author jinzhan
 */
import {SubscriptionClient} from 'subscriptions-transport-ws';
import ApolloClient from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {WebSocketLink} from 'apollo-link-ws';
import emitter from 'tiny-emitter/instance';

const createClient = path => {
    const defaultOptions = {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'ignore'
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all'
        },
        mutate: {
            errorPolicy: 'all'
        }
    };
    const cache = new InMemoryCache();
    const client = new SubscriptionClient(path, {
        reconnect: true
    });
    const link = new WebSocketLink(client);
    let apolloClient = new ApolloClient({
        cache,
        link,
        defaultOptions
    });

    client.on('connected', () => {
        emitter.emit('connected');
    });

    client.on('reconnected', async () => {
        emitter.emit('reconnected');
    });

    client.on('disconnected', () => {
        emitter.emit('disconnected');
    });

    return apolloClient;
};

// 调试模式使用package.json中定义的APP_GRAPHQL_ENDPOINT
// eslint-disable-next-line no-undef
const graphqlEndpoint = APP_GRAPHQL_ENDPOINT || `ws://${location.host}/graphql`;

export default createClient(graphqlEndpoint);
