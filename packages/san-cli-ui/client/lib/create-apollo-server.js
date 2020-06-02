/**
 * @file create ApolloClient
 * @author jinzhan
 */
import {SubscriptionClient} from 'subscriptions-transport-ws';
import ApolloClient from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {WebSocketLink} from 'apollo-link-ws';
import emitter from 'tiny-emitter/instance';

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
        defaultOptions
    });

    // online
    client.on('connected', () => {
        console.log('connected!');
    });

    // 断线重连
    client.on('reconnected', async () => {
        emitter.emit('connected');
    });

    // 触发断线
    client.on('disconnected', () => {
        emitter.emit('disconnected');
    });

    return apolloClient;
};
