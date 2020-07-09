/**
 * @file 控制台日志相关API
 * @author jinzhan
*/

const {CONSOLE_LOG_ADDED} = require('../utils/channels');
const logs = require('../connectors/console');

module.exports = {
    Query: {
        consoleLogs: (root, args, context) => logs.list(context),
        consoleLogLast: (root, args, context) => logs.last(context)
    },

    Mutation: {
        consoleLogsClear: (root, args, context) => logs.clear(context)
    },

    Subscription: {
        consoleLogAdded: {
            subscribe: (parent, args, context) => context.pubsub.asyncIterator(CONSOLE_LOG_ADDED)
        }
    }
};
