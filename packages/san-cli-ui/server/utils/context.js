/**
 * @file Context passed to all resolvers (third argument)
 */
const {
    db
} = require('./db');
const pubsub = require('../main/pubsub');
const cwd = require('../connectors/cwd');

module.exports = () => ({
    db,
    pubsub,
    cwd: cwd.get()
});
