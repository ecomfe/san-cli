/**
 * @file create ApolloClient
 * @author jinzhan
 */
import {SubscriptionClient} from 'subscriptions-transport-ws';
import ApolloClient from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {WebSocketLink} from 'apollo-link-ws';
import {setConnected, resetApollo} from './clientState/connectors';
import defaults from './clientState/defaults';
import resolvers from './clientState/resolvers';
import typeDefs from './clientState/typeDefs';

export default path => {
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
        defaultOptions,
        typeDefs,
        resolvers
    });

    // 客户端cache初始化
    const onCacheInit = cache => cache.writeData({data: defaults()});
    onCacheInit(cache);
    apolloClient.onResetStore(() => onCacheInit(cache));

    // online
    client.on('connected', () => setConnected(true, apolloClient));
    client.on('reconnected', async () => {
        await resetApollo(apolloClient);
        setConnected(true, apolloClient);
    });
    // Offline
    client.on('disconnected', () => setConnected(false, apolloClient));
    client.on('error', () => setConnected(false, apolloClient));

    return apolloClient;
};
