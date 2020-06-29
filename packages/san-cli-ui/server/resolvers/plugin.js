/**
 * @file 项目配置相关的resolver
 * @author zttonly
*/
const plugins = require('../connectors/plugins');
const cwd = require('../connectors/cwd');

module.exports = {
    Plugin: {
        version: (plugin, args, context) => 'version',
        description: (plugin, args, context) => 'description',
        logo: (plugin, args, context) => plugin.getLogo(plugin, context)
    },

    Query: {
        plugins: (root, args, context) => plugins.list(cwd.get(), context)
    },

    Mutation: {
    }
};
