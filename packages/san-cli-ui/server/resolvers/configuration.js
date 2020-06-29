/**
 * @file 项目配置相关的resolver
 * @author zttonly
*/
const configurations = require('../connectors/configurations');

module.exports = {
    Query: {
        configurations: (root, args, context) => configurations.list(context)
    },

    Mutation: {
    }
};
