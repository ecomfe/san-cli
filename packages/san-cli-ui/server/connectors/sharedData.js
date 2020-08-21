/**
 * @file 存储在本地文件中的共享数据
 * @author zttonly
 */

const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const channels = require('../utils/channels');
const $data = require('../models/data');
const {deepGet, deepSet} = require('../utils/deep');

const debug = getDebugLogger('ui:connectors:sharedData');

class SharedData {
    constructor() {
        this.sharedData = new Map();
        this.watchers = new Map();
        // stats用作订阅的计数
        this.stats = new Map();
    }

    get({id, projectId}, context) {
        // id: "san.cli.serve", projectId: "WbWQYW38C"
        const store = this.sharedData.get(projectId);
        if (!store) {
            debug(`projectId(id:${id}, projectId: ${projectId}): No Data Here!`);
            return null;
        }
        let data = store.get(id);
        const hasLocalFile = $data.hasData(projectId, id);
        if (!data && hasLocalFile) {
            data = {
                id,
                updated: new Date(),
                disk: true
            };
        }

        if (data && data.disk) {
            data.value = $data.getData(projectId, id);
        }

        debug(`projectId(${projectId}):`, {data, id, hasLocalFile});

        return data;
    }

    async set({id, projectId, value, disk = false}, context) {
        if (disk) {
            $data.setData(projectId, id, value);
        }

        deepSet(this.sharedData, `${projectId}.${id}`, {
            id,
            ...(disk ? {} : {value}),
            disk,
            updated: new Date()
        });

        const stat = this.getStat({projectId, id});
        stat.value = 0;
        context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
            sharedDataUpdated: {id, projectId, value}
        });

        const watchers = this.fire({id, projectId, value}, context);

        setTimeout(() => {
            debug('SharedData set', id, projectId, value, `(${watchers.length} watchers, ${stat.value} subscriptions)`);
        });

        return {id, value};
    }

    async remove({id, projectId}, context) {
        const store = this.sharedData.get(projectId);
        if (store) {
            const data = store.get(id);
            if (data && data.disk) {
                $data.remove(projectId, id);
            }
            store.delete(id);
        }

        context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
            sharedDataUpdated: {id, projectId, value: undefined}
        });

        this.fire({id, projectId, value: undefined}, context);
        debug('SharedData remove', id, projectId);
    }

    /**
     * shareData发生改变的时候触发回调
     * @param {string} id json文件名称
     * @param {string} projectId 项目名称
     * @param {Function} handler 回调方法
    */
    watch({id, projectId}, handler) {
        let handlers = deepGet(this.watchers, `${projectId}.${id}`);
        if (!handlers) {
            handlers = [];
            deepSet(this.watchers, `${projectId}.${id}`, handlers);
        }
        handlers.push(handler);
    }

    /**
     * 清除shareData回调
     * @param {string} id json文件名称
     * @param {string} projectId 项目名称
     * @param {Function} handler 回调方法
    */
    unwatch({id, projectId}, handler) {
        const handlers = deepGet(this.watchers, `${projectId}.${id}`);
        if (!handlers) {
            return;
        }

        const index = handlers.indexOf(handler);
        if (index !== -1) {
            handlers.splice(index, 1);
        }
    }

    /**
     * 清除shareData项目的全部回调
     * @param {string} projectId 项目名称
     * @param {Function} handler 回调方法
    */
    unwatchAll(projectId) {
        this.watchers.delete(projectId);
    }

    fire({id, projectId, value}, context) {
        const handlers = deepGet(this.watchers, `${projectId}.${id}`) || [];
        handlers.forEach(fn => fn(value, id));
        return handlers;
    }

    // 增加shareData的日志统计
    getStat({id, projectId}) {
        let stat = deepGet(this.stats, `${projectId}.${id}`);
        if (!stat) {
            stat = {
                value: 0
            };
            deepSet(this.stats, `${projectId}.${id}`, stat);
        }
        return stat;
    }

    addStat({id, projectId}) {
        const stat = this.getStat({projectId, id});
        stat.value++;
    }
};

module.exports = new SharedData();
