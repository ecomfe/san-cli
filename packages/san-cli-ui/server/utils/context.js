/**
 * @file resolvers的第3个参数
 */
const db = require('../models/db');
const pubsub = require('../main/pubsub');
const cwd = require('../connectors/cwd');

module.exports = () => ({
    db,
    pubsub,
    cwd: cwd.get()
});
