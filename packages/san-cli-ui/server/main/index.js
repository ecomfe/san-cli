/**
 * @file 创建ApolloServer实例
 * @author jinzhan
*/

const {ApolloServer} = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolves');
const db = require('./db');
const pubsub = require('./pubsub');

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
    }
});
