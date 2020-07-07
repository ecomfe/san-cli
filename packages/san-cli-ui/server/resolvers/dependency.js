/**
 * @file 安装依赖的resolver
 * @author sunxiaoyu333
*/
const dependency = require('../connectors/dependency');

module.exports = {
    Mutation: {
        dependencyInstall: (root, args, context) => dependency.install(args, context),
        dependencyUninstall: (root, args, context) => dependency.unInstall(args, context),
        dependencyItem: (root, args, context) => dependency.getVersion(args, context)
    },
    Query: {
        dependencies: (root, args, context) => dependency.list(args, context)
    }
};
