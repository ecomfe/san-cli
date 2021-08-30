const {VIEW_ADDED, VIEW_CHANGED, VIEW_REMOVED} = require('../utils/channels');
const views = require('../connectors/views');

module.exports = {
    Query: {
        views: (root, args, context) => views.getViews(context)
    },

    Mutation: {
        viewOpen: (root, {id}, context) => views.open(id, context)
    },

    Subscription: {
        viewAdded: {
            subscribe: (parent, args, context) => context.pubsub.asyncIterator(VIEW_ADDED)
        },
        viewChanged: {
            subscribe: (parent, args, context) => context.pubsub.asyncIterator(VIEW_CHANGED)
        },
        viewRemoved: {
            subscribe: (parent, args, context) => context.pubsub.asyncIterator(VIEW_REMOVED)
        }
    }
};
