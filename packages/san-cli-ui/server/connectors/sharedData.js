/**
 * @file 存储在本地文件中的共享数据
 * @author zttonly
 */

const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const channels = require('../utils/channels');
const $data = require('../models/data');
const {get, set, unset} = require('lodash');

const debug = getDebugLogger('ui:connectors:sharedData');

class SharedData {
    constructor() {
        this.data = {};
        this.watchers = {};
        // stats用作订阅的计数
        this.stats = {};
    }

    get({id, projectId}, context) {
        const store = get(this.data, projectId);
        if (!store) {
            debug(`Shareddata.get: projectId(id:${id}, projectId: ${projectId}): No Data Here!`);
            return null;
        }
        let data = get(store, id);
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

        debug(`getShareddata: projectId(${projectId}):`, {data, id, hasLocalFile});

        return data;
    }

    async set({id, projectId, disk = false}, value, context) {
        if (disk) {
            $data.setData(projectId, id, value);
        }

        set(this.data, [projectId, id], {
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
            debug('setSharedData:', id, projectId, value, `(${watchers.length} watchers, ${stat.value} subscriptions)`);
            debug({id, projectId}, this.get({id, projectId}));
        });

        return {id, value};
    }

    async remove({id, projectId}, context) {
        const store = get(this.data, projectId);
        if (store) {
            const data = get(store, id);
            if (data && data.disk) {
                $data.remove(projectId, id);
            }
            unset(store, id);
        }

        context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
            sharedDataUpdated: {id, projectId, value: undefined}
        });

        this.fire({id, projectId, value: undefined}, context);
        debug('SharedData remove', id, projectId);
    }

    // shareData发生改变的时候触发回调
    watch({id, projectId}, handler) {
        let handlers = get(this.watchers, [projectId, id]);
        if (!handlers) {
            handlers = [];
            set(this.watchers, [projectId, id], handlers);
        }
        handlers.push(handler);
    }

    // 清除shareData回调
    unwatch({id, projectId}, handler) {
        const handlers = get(this.watchers, [projectId, id]);
        if (!handlers) {
            return;
        }

        const index = handlers.indexOf(handler);
        if (index !== -1) {
            handlers.splice(index, 1);
        }
    }

    // 清除shareData项目的全部回调
    unwatchAll(projectId) {
        unset(this.watchers, projectId);
    }

    fire({id, projectId, value}, context) {
        const handlers = get(this.watchers, [projectId, id]) || [];
        handlers.forEach(fn => fn(value, id));
        return handlers;
    }

    // 增加shareData的日志统计
    getStat({id, projectId}) {
        let stat = set(this.stats, [projectId, id]);
        if (!stat) {
            stat = {
                value: 0
            };
            set(this.stats, [projectId, id], stat);
        }
        return stat;
    }

    addStat({id, projectId}) {
        const stat = this.getStat({projectId, id});
        stat.value++;
    }
};

module.exports = new SharedData();
