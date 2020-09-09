/**
 * @file console connectors
 * @author zttonly
 */

const shortId = require('shortid');
const events = require('../utils/events');
const {CONSOLE_LOG_ADDED} = require('../utils/channels');
const getContext = require('../utils/context');

class Console {
    constructor() {
        this.logs = [];

        this.add({type: 'info'}, getContext());

        events.on('log', log => this.add(log, getContext()));
    }
    add(log, context) {

        const item = {
            id: shortId.generate(),
            date: new Date().toISOString(),
            ...log
        };
        this.logs.push(item);
        context.pubsub.publish(CONSOLE_LOG_ADDED, {
            consoleLogAdded: item
        });
        return item;
    }
    list() {
        return this.logs;
    }
    last() {
        let logs = this.logs;
        return logs.length ? logs[logs.length - 1] : null;
    }
    clear() {
        this.logs = [];
        return this.logs;
    }
}

module.exports = new Console();
