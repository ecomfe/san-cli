/**
 * @file 安装依赖的resolver
 * @author sunxiaoyu333
*/
const dependencies = require('../connectors/dependencies');

module.exports = {
    Mutation: {
        dependencyInstall: (root, args, context) => dependencies.install(args, context),
        dependencyUninstall: (root, args, context) => dependencies.unInstall(args, context),
        dependencyItem: (root, args, context) => dependencies.getVersion(args, context)
    },
    Query: {
        dependencies: (root, args, context) => dependencies.list(args, context)
    }
};
