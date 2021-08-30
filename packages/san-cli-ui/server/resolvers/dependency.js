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
        dependencyItem: (root, args, context) => dependencies.getVersion(args, context)
    },
    Query: {
        dependencies: (root, args, context) => dependencies.list(args, context),
        dependenciesSearch: (root, {input}, context) => dependencies.search(input, context)
    }
};
