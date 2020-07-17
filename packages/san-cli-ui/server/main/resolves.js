/**
 * @file 主resolvers入口，集成了./resolvers下全部文件
 * @author jinzhan
*/

const globby = require('globby');
const {GraphQLJSON} = require('graphql-type-json');
const {CWD_CHANGED, CLIENT_ADDON_ADDED} = require('../utils/channels');
const cwd = require('../connectors/cwd');
const clientAddons = require('../connectors/client-addons');

const resolvers = [{
    JSON: GraphQLJSON,

    DescribedEntity: {
        __resolveType(obj, context, info) {
            return null;
        }
    },

    ClientAddon: {
        url: (addon, args, context) => clientAddons.getUrl(addon, context)
    },

    Query: {
        cwd: () => cwd.get(),
        clientAddons: (root, args, context) => clientAddons.list(context)
    },

    Mutation: {
    },

    Subscription: {
        cwdChanged: {
            subscribe: (parent, args, {
                pubsub
            }) => pubsub.asyncIterator(CWD_CHANGED)
        },
        clientAddonAdded: {
            subscribe: (parent, args, {pubsub}) => pubsub.asyncIterator(CLIENT_ADDON_ADDED)
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
