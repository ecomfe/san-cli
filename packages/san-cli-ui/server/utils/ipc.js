const ipc = require('node-ipc');
const {log} = require('san-cli-utils/ttyLogger');

ipc.config.id = process.env.SAN_CLI_IPC || 'san-cli';
ipc.config.retry = 1500;
ipc.config.silent = true;

const listeners = [];

ipc.serve(() => {
    ipc.server.on('message', (data, socket) => {
        log('IPC message', data);
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
        log('IPC ack', data);
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
    log('IPC send', data);
    ipc.server.broadcast('message', data);
}

module.exports = {
    on,
    off,
    send
};
