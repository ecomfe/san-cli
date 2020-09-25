/**
 * The MIT License (MIT)
 * Copyright (c) 2017-present, Yuxi (Evan) You
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/vuejs/vue-cli/blob/dev/LICENSE
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-shared-utils/lib/ipc.js
 */

const ipc = require('node-ipc');

const DEFAULT_ID = process.env.SAN_CLI_IPC || 'san-cli';
const DEFAULT_IDLE_TIMEOUT = 3000;
const DEFAULT_OPTIONS = {
    networkId: DEFAULT_ID,
    autoConnect: true,
    disconnectOnIdle: false,
    idleTimeout: DEFAULT_IDLE_TIMEOUT,
    namespaceOnProject: true
};

const PROJECT_ID = process.env.SAN_CLI_PROJECT_ID;

exports.IpcMessenger = class IpcMessenger {
    constructor(options = {}) {
        options = Object.assign({}, DEFAULT_OPTIONS, options);
        ipc.config.id = this.id = options.networkId;
        ipc.config.retry = 1500;
        ipc.config.silent = true;

        this.connected = false;
        this.connecting = false;
        this.disconnecting = false;
        this.queue = null;
        this.options = options;

        this.listeners = [];

        this.disconnectTimeout = 15000;
        this.idleTimer = null;

        // Prevent forced process exit
        // (or else ipc messages may not be sent before kill)
        process.exit = code => {
            process.exitCode = code;
        };

        this._reset();
    }

    checkConnection() {
        if (!ipc.of[this.id]) {
            this.connected = false;
        }
    }

    send(data, type = 'message') {
        this.checkConnection();
        if (this.connected) {
            if (this.options.namespaceOnProject && PROJECT_ID) {
                data = {
                    // eslint-disable-next-line
                    _projectId: PROJECT_ID,
                    // eslint-disable-next-line
                    _data: data
                };
            }

            ipc.of[this.id].emit(type, data);

            clearTimeout(this.idleTimer);
            if (this.options.disconnectOnIdle) {
                this.idleTimer = setTimeout(() => {
                    this.disconnect();
                }, this.options.idleTimeout);
            }
        }
        else {
            this.queue.push(data);
            if (this.options.autoConnect && !this.connecting) {
                this.connect();
            }
        }
    }

    connect() {
        this.checkConnection();
        if (this.connected || this.connecting) {
            return;
        }

        this.connecting = true;
        this.disconnecting = false;
        ipc.connectTo(this.id, () => {
            this.connected = true;
            this.connecting = false;
            this.queue && this.queue.forEach(data => this.send(data));
            this.queue = null;

            ipc.of[this.id].on('message', this._onMessage);
        });
    }

    disconnect() {
        this.checkConnection();
        if (!this.connected || this.disconnecting) {
            return;
        }

        this.disconnecting = true;
        this.connecting = false;

        const ipcTimer = setTimeout(() => {
            this._disconnect();
        }, this.disconnectTimeout);

        this.send({
            done: true
        }, 'ack');

        ipc.of[this.id].on('ack', data => {
            if (data.ok) {
                clearTimeout(ipcTimer);
                this._disconnect();
            }
        });
    }

    on(listener) {
        this.listeners.push(listener);
    }

    off(listener) {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }

    _reset() {
        this.queue = [];
        this.connected = false;
    }

    _disconnect() {
        this.connected = false;
        this.disconnecting = false;
        ipc.disconnect(this.id);
        this._reset();
    }

    _onMessage(data) {
        this.listeners.forEach(fn => {
            if (this.options.namespaceOnProject && data._projectId) {
                if (data._projectId === PROJECT_ID) {
                    data = data._data;
                }
                else {
                    return;
                }
            }
            fn(data);
        });
    }
};
