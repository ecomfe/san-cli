const {
    ApolloServer
} = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolves');

const server = new ApolloServer({
    typeDefs,
    resolvers
});

module.exports = server;