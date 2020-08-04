/**
 * @file 对sharedData的封装
 * @author jinzhan
 */

const sharedData = require('../models/sharedData');

class SharedData {
    constructor({project, context}) {
        this.sharedData = sharedData;
        this.project = project;
        this.context = context;
    }

    /**
     * 设置sharedData中的数据
     *
     * @param {string} id sharedData的id
     * @param {any} value 通常是json
     * @param {Object} options options
     */
    async set(id, value, {disk = false} = {}) {
        return this.sharedData.set({
            id,
            projectId: this.project.id,
            value,
            disk
        }, this.context);
    }

    /**
     * 获取sharedData中的数据
     *
     * @param {string} id sharedData的id
     */
    get(id) {
        return this.sharedData.get({
            id,
            projectId: this.project.id
        }, this.context);
    }

    /**
     * 清除sharedData中的数据
     *
     * @param {string} id sharedData的id
     * @return {Function}
     */
    async remove(id) {
        return this.sharedData.remove({
            id,
            projectId: this.project.id
        }, this.context);
    }

    /**
     * 监听sharedData的变化
     *
     * @param {string} id sharedData的id
     * @param {Function} handler Callback
     */
    watch(id, handler) {
        this.sharedData.watch({
            id,
            projectId: this.project.id
        }, handler);
    }

    /**
     * 清除sharedData的监听
     *
     * @param {string} id sharedData的id
     * @param {Function} handler Callback
     */
    unwatch(id, handler) {
        this.sharedData.unwatch({
            id,
            projectId: this.project.id
        }, handler);
    }
}

module.exports = SharedData;
