const {
    ApolloServer
} = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolves');
const pubsub = require('./pubsub');
const {db} = require('../utils/lib/db');

const server = subscribtionpPath => new ApolloServer({
    typeDefs,
    resolvers,
    pubsub,
    context: async ({req, connection}) => {
        return {
            db,
            pubsub
        };
    },
    // Resolvers context from WebSocket
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

module.exports = server;