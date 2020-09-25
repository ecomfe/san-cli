/**
 * @file 项目配置相关的resolver
 * @author zttonly
*/
const configurations = require('../connectors/configurations');
const cwd = require('../connectors/cwd');
const plugins = require('../connectors/plugins');

module.exports = {
    Configuration: {
        tabs: (configuration, args, context) => configurations.getPromptTabs(configuration.id, context),
        plugin: (configuration, args, context) => plugins.findOne({
            id: configuration.pluginId, file: cwd.get()
        }, context)
    },
    Query: {
        configurations: (root, args, context) => configurations.list(context),
        configuration: (root, {id}, context) => configurations.findOne(id, context)
    },

    Mutation: {
        configurationSave: (root, {id}, context) => configurations.save(id, context),
        configurationCancel: (root, {id}, context) => configurations.cancel(id, context)
    }
};
