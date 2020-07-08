/**
 * @file 简单的GraphQL pubsub机制
 * @author jinzhan
*/

const {PubSub} = require('graphql-subscriptions');

module.exports = new PubSub();