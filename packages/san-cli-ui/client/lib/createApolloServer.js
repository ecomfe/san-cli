/**
 * @file create ApolloClient
 * @author jinzhan
 */
import {SubscriptionClient} from 'subscriptions-transport-ws';
import ApolloClient from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {WebSocketLink} from 'apollo-link-ws';

export default path => {
    const defaultOptions = {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'ignore',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    };
    const cache = new InMemoryCache();
    const client = new SubscriptionClient(path, {
        reconnect: true,
    });
    const link = new WebSocketLink(client);
    return new ApolloClient({
        cache,
        link,
        defaultOptions
    });
};