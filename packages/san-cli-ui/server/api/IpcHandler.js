/**
 * @file 对ipc的简单封装，
 *
 * @author jinzhan
*/
const ipc = require('../utils/ipc');

class IpcHandler {
    constructor() {
        this.ipc = ipc;
        this.handlers = [];
    }
    /**
     * 往IpcMessenger里面添加listener
     *
     * @param {Function} callback 可以带参数的回调方法
     * @return {Function}
     */
    on(callback) {
        const handler = ({data, emit}) => {
            if (data.$projectId) {
                if (data.$projectId !== this.project.id) {
                    return;
                }
                data = data.$data;
            }
            callback({data, emit});
        };
        callback.$handler = handler;
        this.handlers.push(handler);
        return this.ipc.on(handler);
    }

    /**
     * 清除IpcMessenger里面的listener
     *
     * @param {any} callback 要清除的callback，参数同ipcOn
     */
    off(callback) {
        const handler = callback.$handler;
        if (!handler) {
            return;
        }
        const index = this.handlers.indexOf(handler);
        if (index !== -1) {
            this.handlers.splice(index, 1);
        }
        this.ipc.off(handler);
    }

    /**
     * 向连接的所有的IPC客户端发送消息
     *
     * @param {any} data Message data
     */
    send(data) {
        this.ipc.send(data);
    }
};

module.exports = IpcHandler;
