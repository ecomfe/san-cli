/**
 * @file sharedData connectors
 * @author zttonly
 */
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const channels = require('../utils/channels');
const {log} = require('san-cli-utils/ttyLogger');

class SharedData {
    constructor() {
        /**
         * @typedef SharedData
         * @prop {string} id
         * @prop {any} value
         * @prop {Date} updated
         * @prop {boolean} disk
        */
        const rcFolder = path.join(os.homedir(), '.san-cli-ui');
        fs.ensureDirSync(path.resolve(rcFolder));
        this.rootFolder = path.resolve(rcFolder, 'shared-data');
        fs.ensureDirSync(this.rootFolder);

        /**
         * @type {Map<string, Map<string, SharedData>>}
         */
        this.sharedData = new Map();
        this.watchers = new Map();
        this.stats = new Map();
    }
    getStats(type, id) {
        let dic = this.stats.get(type);
        if (!dic) {
            dic = new Map();
            this.stats.set(type, dic);
        }
        let stat = dic.get(id);
        if (!stat) {
            stat = {
                value: 0
            };
            dic.set(id, stat);
        }
        return stat;
    }
    get({id, projectId}, context) {
        const store = this.sharedData.get(projectId);
        if (!store) {
            return null;
        }

        let data = store.get(id);
        if (data == null) {
            if (fs.existsSync(path.resolve(this.rootFolder, projectId, `${id}.json`))) {
                data = {
                    id,
                    updated: new Date(),
                    disk: true
                };
            }
        }

        if (data && data.disk) {
            data.value = this.readOnDisk({id, projectId}, context);
        }

        return data;
    }
    async readOnDisk({id, projectId}, context) {
        const file = path.resolve(this.rootFolder, projectId, `${id}.json`);
        if (await fs.exists(file)) {
            return fs.readJson(file);
        }
        return null;
    }
    async set({id, projectId, value, disk = false}, context) {
        if (disk) {
            await this.writeOnDisk({id, projectId, value}, context);
        }
        let store = this.sharedData.get(projectId);
        if (!store) {
            store = new Map();
            this.sharedData.set(projectId, store);
        }
        store.set(id, {
            id,
            ...(disk ? {} : {value}),
            disk,
            updated: new Date()
        });

        const stat = this.stats.get(`shared-data_${projectId}`, id);
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
    async writeOnDisk({id, projectId, value}, context) {
        const projectFolder = path.resolve(this.rootFolder, projectId);
        await fs.ensureDir(projectFolder);
        await fs.writeJson(path.resolve(projectFolder, `${id}.json`), value);
    }
    async remove({id, projectId}, context) {
        const store = this.sharedData.get(projectId);
        if (store) {
            const data = store.get(id);
            if (data && data.disk) {
                fs.remove(path.resolve(this.rootFolder, projectId, `${id}.json`));
            }
            store.delete(id);
        }

        context.pubsub.publish(channels.SHARED_DATA_UPDATED, {
            sharedDataUpdated: {id, projectId, value: undefined}
        });

        this.notify({id, projectId, value: undefined}, context);
        log('SharedData remove', id, projectId);
    }
    watch({id, projectId}, handler) {
        let store = this.watchers.get(projectId);
        if (!store) {
            store = new Map();
            this.watchers.set(projectId, store);
        }
        let handlers = store.get(id);
        if (!handlers) {
            handlers = [];
            store.set(id, handlers);
        }
        handlers.push(handler);
    }
    unwatch({id, projectId}, handler) {
        const store = this.watchers.get(projectId);
        if (!store) {
            return;
        }
        const handlers = store.get(id);
        if (!handlers) {
            return;
        }

        const index = handlers.indexOf(handler);
        if (index !== -1) {
            handlers.splice(index, 1);
        }
    }

    unWatchAll({projectId}, context) {
        this.watchers.delete(projectId);
    }

    notify({id, projectId, value}, context) {
        let handlers = this.watchers.get(projectId);
        if (handlers) {
            handlers = handlers.get(id);
        }
        if (handlers) {
            handlers.forEach(fn => fn(value, id));
        }
        return handlers || [];
    }
}

module.exports = new SharedData();
