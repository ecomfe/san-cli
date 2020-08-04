/**
 * @file 本地共享数据
 * @author zttonly
 */
const path = require('path');
const fs = require('fs-extra');
const {log} = require('san-cli-utils/ttyLogger');
const rcPath = require('../utils/rcPath');
const channels = require('../utils/channels');
const {deepGet, deepSet} = require('../utils/deep');

const shareDataDir = 'shared-data';
const rootFolder = path.resolve(rcPath, shareDataDir);
fs.ensureDirSync(rcPath);
fs.ensureDirSync(rootFolder);

class SharedData {
    constructor() {
        this.rootFolder = rootFolder;
        this.sharedData = new Map();
        this.watchers = new Map();
        // stats用作订阅的计数
        this.stats = new Map();
    }

    get({id, projectId}, context) {
        const store = this.sharedData.get(projectId);
        if (!store) {
            return null;
        }
        let data = store.get(id);
        const targetFile = path.resolve(this.resolve(projectId, id));
        const hasLocalFile = fs.existsSync(targetFile);
        if (!data && hasLocalFile) {
            data = {
                id,
                updated: new Date(),
                disk: true
            };
        }

        if (data && data.disk) {
            data.value = hasLocalFile ? fs.readJSONSync(targetFile) : null;
        }

        return data;
    }

    async set({id, projectId, value, disk = false}, context) {
        // 写入到文件中
        if (disk) {
            const projectFolder = path.resolve(this.rootFolder, projectId);
            fs.ensureDirSync(projectFolder);
            fs.writeJsonSync(path.resolve(projectFolder, `${id}.json`), value);
        }

        deepSet(this.sharedData, `${projectId}.${id}`, {
            id,
            ...(disk ? {} : {value}),
            disk,
            updated: new Date()
        });

        const stat = this.stats.get(projectId, id);
        stat.value = 0;
        context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
            sharedDataUpdated: {id, projectId, value}
        });

        const watchers = this.notify({id, projectId, value}, context);

        setTimeout(() => (
            log('SharedData set', id, projectId, value, `(${watchers.length} watchers, ${stat.value} subscriptions)`)
        ));

        return {id, value};
    }

    resolve(projectId, id) {
        return path.resolve(this.rootFolder, projectId, `${id}.json`);
    }

    async remove({id, projectId}, context) {
        const store = this.sharedData.get(projectId);
        if (store) {
            const data = store.get(id);
            if (data && data.disk) {
                fs.remove(this.resolve(projectId, id));
            }
            store.delete(id);
        }

        context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
            sharedDataUpdated: {id, projectId, value: undefined}
        });

        this.notify({id, projectId, value: undefined}, context);
        log('SharedData remove', id, projectId);
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
    unWatchAll(projectId) {
        this.watchers.delete(projectId);
    }

    notify({id, projectId, value}, context) {
        const handlers = deepGet(this.watchers, `${projectId}.${id}`) || [];
        handlers.forEach(fn => fn(value, id));
        return handlers;
    }

    // 增加shareData的日志统计
    getStat(projectId, id) {
        let stat = deepGet(this.stats, `${projectId}.${id}`);
        if (!stat) {
            stat = {
                value: 0
            };
            deepSet(this.stats, `${projectId}.${id}`, stat);
        }
        return stat;
    }

    addStat(projectId, id) {
        const stat = this.getStat(projectId, id);
        stat.value++;
    }
};

module.exports = new SharedData();
