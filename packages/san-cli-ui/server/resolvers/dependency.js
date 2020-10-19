/**
 * @file 安装依赖的resolver
 * @author sunxiaoyu333
*/
const dependencies = require('../connectors/dependencies');

module.exports = {
    Dependency: {
        version: (dependency, args, context) => dependencies.getVersion(dependency, context),
        description: (dependency, args, context) => dependencies.getDescription(dependency, context)
    },

    Mutation: {
        dependencyInstall: (root, {input}, context) => dependencies.install(input, context),
        dependencyUninstall: (root, args, context) => dependencies.unInstall(args, context),
        dependencyItem: (root, {id}, context) => dependencies.getVersion(dependencies.findOne(id) || {}, context)
    },
    Query: {
        dependencies: (root, args, context) => dependencies.list(args, context)
    }
};
