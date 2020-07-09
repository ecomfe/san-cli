/**
 * @file 主resolvers入口，集成了./resolvers下全部文件
 * @author jinzhan
*/

const globby = require('globby');
const {GraphQLJSON} = require('graphql-type-json');
const {CWD_CHANGED} = require('../utils/channels');
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

    Mutation: {
    },

    Subscription: {
        cwdChanged: {
            subscribe: (parent, args, {
                pubsub
            }) => pubsub.asyncIterator(CWD_CHANGED)
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
