/**
 * @file 主resolvers入口，集成了./resolvers下全部文件
 * @author jinzhan
*/

const globby = require('globby');
const {GraphQLJSON} = require('graphql-type-json');
const channels = require('../utils/channels');
const cwd = require('../connectors/cwd');
const clientAddons = require('../connectors/clientAddons');
const sharedData = require('../connectors/sharedData');
const theme = require('../connectors/theme');
const {withFilter} = require('graphql-subscriptions');

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
        clientAddons: (root, args, context) => clientAddons.list(context),
        sharedData: (root, args, context) => sharedData.get(args, context),
        theme: (root, args, context) => theme.get(context)
    },

    Mutation: {
        sharedDataUpdate: (root, args, context) => sharedData.set(args, context),
        themeChange: (root, args, context) => theme.set(args.theme, context)
    },

    Subscription: {
        cwdChanged: {
            subscribe: (parent, args, {
                pubsub
            }) => pubsub.asyncIterator(channels.CWD_CHANGED)
        },
        clientAddonAdded: {
            subscribe: (parent, args, {pubsub}) => pubsub.asyncIterator(channels.CLIENT_ADDON_ADDED)
        },
        sharedDataUpdated: {
            subscribe: withFilter(
                (parent, args, {pubsub}) => pubsub.asyncIterator(channels.SHARED_DATA_UPDATED),
                (payload, vars) => {
                    const result = payload.sharedDataUpdated.id === vars.id
                        && payload.sharedDataUpdated.projectId === vars.projectId;
                    if (result) {
                        sharedData.addStat({id: vars.id, projectId: vars.projectId});
                    }
                    return result;
                }
            )
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
