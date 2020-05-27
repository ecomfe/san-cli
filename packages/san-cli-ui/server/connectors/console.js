const shortId = require('shortid');
const pubsub = require('../main/pubsub');
const events = require('../utils/events');
const {CONSOLE_LOG_ADDED} = require('../utils/channels');

/**
 * @typedef Log
 * @prop {string} id
 * @prop {string} date
 * @prop {LogType} type
 * @prop {string} message
 */
let logs = [];

/**
 * @param {Log} log
 * @param {any} pubsub
 */
const add = (log, pubsub) => {
    /** @type {Log} */
    const item = {
        id: shortId.generate(),
        date: new Date().toISOString(),
        ...log
    };
    logs.push(item);
    pubsub.publish(CONSOLE_LOG_ADDED, {
        consoleLogAdded: item
    });
    return item;
};

const list = () => logs;

const last = () => (logs.length ? logs[logs.length - 1] : null);

const clear = () => logs = [];

events.on('log', log => {
    add(log, pubsub);
});

module.exports = {
    add,
    list,
    last,
    clear
};
