/**
 * @file 创建ApolloServer实例
 * @author jinzhan
*/

const {ApolloServer} = require('apollo-server-express');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const typeDefs = require('./schema');
const resolvers = require('./resolves');
const db = require('../models/db');
const pubsub = require('./pubsub');
const debug = getDebugLogger('ui:ApolloServer');

module.exports = subscribtionpPath => new ApolloServer({
    typeDefs,
    resolvers,
    pubsub,
    context: async ({req, connection}) => {
        return {
            db,
            pubsub
        };
    },
    subscriptions: {
        path: subscribtionpPath,
        onConnect: async (connection, websocket) => {
            return {
                db,
                pubsub
            };
        }
    },
    formatError: err => {
        if (err) {
            debug('Internal Server Error:', err);
        }
        return err;
    }
});
