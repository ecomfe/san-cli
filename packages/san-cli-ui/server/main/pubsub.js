/**
 * @file 简单的GraphQL pubsub机制
 * @author jinzhan
*/

const {PubSub} = require('graphql-subscriptions');

const pubSub = new PubSub();
// Increase limit
pubSub.ee.setMaxListeners(Infinity);
module.exports = pubSub;
