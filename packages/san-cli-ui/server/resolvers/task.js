/**
 * @file 任务相关的API
 * @author jinzhan
*/

// Subs
const {withFilter} = require('graphql-subscriptions');
const channels = require('../utils/channels');
// Connectors
const tasks = require('../connectors/tasks');
const projects = require('../connectors/projects');

module.exports = {
    // Task: {
    //     prompts: (task, args, context) => tasks.getPrompts(task.id, context),
    //     project: (task, args, context) => projects.findByPath(task.path, context)
    // },

    Query: {
        tasks: (root, args, context) => tasks.getTasks(undefined, context),
        task: (root, {id}, context) => tasks.findTask(id, context)
    },

    Mutation: {
        taskRun: (root, {id}, context) => tasks.run(id, context),
        taskStop: (root, {id}, context) => tasks.stop(id, context),
        taskLogsClear: (root, {id}, context) => tasks.clearLogs(id, context),
        taskOpen: (root, {id}, context) => tasks.open(id, context),
        taskSaveParameters: (root, {id}, context) => tasks.saveParameters({
            id
        }, context),
        taskRestoreParameters: (root, {id}, context) => tasks.restoreParameters({
            id
        }, context)
    },

    Subscription: {
        taskChanged: {
            subscribe: (parent, args, {pubsub}) => pubsub.asyncIterator(channels.TASK_CHANGED)
        },
        taskLogAdded: {
            // subscribe: withFilter(
            //     (parent, args, {pubsub}) => pubsub.asyncIterator(channels.TASK_LOG_ADDED),
            //     (payload, vars) => {
            //         console.log('payload.taskLogAdded.taskId === vars.id:', payload.taskLogAdded.taskId, vars.id);
            //         return payload.taskLogAdded.taskId === vars.id;
            //     }
            // )
            subscribe: (parent, args, {pubsub}) => pubsub.asyncIterator(channels.TASK_LOG_ADDED)
        }
    }
};
