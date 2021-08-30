const ipc = require('node-ipc');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');

const debug = getDebugLogger('ui:ipc');

ipc.config.id = process.env.SAN_CLI_IPC || 'san-cli';

debug('ipc.config.id:' + ipc.config.id);

ipc.config.retry = 1500;
ipc.config.silent = true;

const listeners = [];

ipc.serve(() => {
    ipc.server.on('message', (data, socket) => {
        debug('IPC message', data);
        debug('Count of Listeners:', listeners.length);
        for (const listener of listeners) {
            listener({
                data,
                emit: data => {
                    ipc.server.emit(socket, 'message', data);
                }
            });
        }
    });

    ipc.server.on('ack', (data, socket) => {
        debug('IPC ack', data);
        if (data.done) {
            ipc.server.emit(socket, 'ack', {
                ok: true
            });
        }
    });
});

ipc.server.start();

function on(cb) {
    listeners.push(cb);
    return () => off(cb);
}

function off(cb) {
    const index = listeners.indexOf(cb);
    if (index !== -1) {
        listeners.splice(index, 1);
    }
}

function send(data) {
    debug('IPC send', data);
    ipc.server.broadcast('message', data);
}

module.exports = {
    on,
    off,
    send
};
