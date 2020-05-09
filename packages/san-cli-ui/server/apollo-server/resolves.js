const globby = require('globby');
const {
    GraphQLJSON
} = require('graphql-type-json');
const channels = require('./channels');
const cwd = require('../connectors/cwd');

const resolvers = [{
    JSON: GraphQLJSON,

    DescribedEntity: {
        __resolveType(obj, context, info) {
            return null;
        }
    },

    Query: {
        cwd: () => cwd.get()
    },

    // Mutation: {
    // },

    Subscription: {
        cwdChanged: {
            subscribe: (parent, args, {
                pubsub
            }) => pubsub.asyncIterator(channels.CWD_CHANGED)
        }
    }
}];

// Load resolvers
const paths = globby.sync(['../resolvers/*.js'], {
    cwd: __dirname,
    absolute: true
});
paths.forEach(file => {
    const r = require(file);
    r && resolvers.push(r);
});

module.exports = resolvers;
