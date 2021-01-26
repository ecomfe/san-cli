/**
 * @file 项目plugins相关的resolver
 * @author zttonly, Lohoyo
*/
const plugins = require('../connectors/plugins');
const cwd = require('../connectors/cwd');
const channels = require('../utils/channels');
const dependencies = require('../connectors/dependencies');

module.exports = {
    Plugin: {
        version: (plugin, args, context) => dependencies.getVersion(plugin, context),
        description: (plugin, args, context) => dependencies.getDescription(plugin, context)
    },

    Query: {
        plugins: (root, args, context) => plugins.list(cwd.get(), context)
    },

    Mutation: {
        pluginActionCall: (root, args, context) => plugins.callAction(args, context),
        pluginItem: (root, {id}, context) => {
            return dependencies.getVersion(plugins.findOne({id, file: cwd.get()}) || {}, context);
        }
    },

    Subscription: {
        pluginActionCalled: {
            subscribe: (parent, args, {pubsub}) => pubsub.asyncIterator(channels.PLUGIN_ACTION_CALLED)
        },
        pluginActionResolved: {
            subscribe: (parent, args, {pubsub}) => pubsub.asyncIterator(channels.PLUGIN_ACTION_RESOLVED)
        }
    }
};
