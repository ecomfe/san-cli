const {
    ApolloServer
} = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolves');
const pubsub = require('./pubsub');

const server = subscribtionpPath => new ApolloServer({
    typeDefs,
    resolvers,
    pubsub,
    context: async ({req, connection}) => {
        let contextData;
        try {
            if (connection) {
                // check connection for metadata
                contextData = connection.context;
            }
            else {
                // check from req
                contextData = req.context || {};
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
        contextData = Object.assign({}, contextData, {pubsub});
        return contextData;
    },
    // Resolvers context from WebSocket
    subscriptions: {
        path: subscribtionpPath,
        onConnect: async (connection, websocket) => {
            let contextData = {};
            try {
                contextData = connection.context;
                contextData = Object.assign({}, contextData, {pubsub});
            } catch (e) {
                console.error(e);
                throw e;
            }
            return contextData;
        }
    }
});

module.exports = server;