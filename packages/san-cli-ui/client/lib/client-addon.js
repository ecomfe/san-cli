/**
 * @file 集成第三方组件
 * @author jinzhan
*/
import san from 'san';
import {router} from 'san-router';
import deepmerge from 'deepmerge';
import localization from '@locales/zh.json';

export default class ClientAddon {
    constructor() {
        this.components = new Map();
        this.listeners = new Map();
    }

    /**
     * 向ClientAddon中添加组件
     *
     * @param {string} id 组件的标识
     * @param {Object} options san.defineComponent快捷定义参数，详见：https://baidu.github.io/san/doc/main-members/#Component
     */
    defineComponent(id, options) {
        const component = san.defineComponent(options);
        this.components.set(id, component);

        // 调用组件相应的回调方法，这里可以配合awaitComponent添加回调
        const listeners = this.listeners.get(id);
        if (listeners) {
            listeners.forEach(listener => listener(component));
            this.listeners.delete(id);
        }
    }

    /**
     * 注册一个Promise，为后续添加的组件，注册回调方法
     *
     * @param {string} id 组件的标识
    */
    awaitComponent(id) {
        return new Promise((resolve, reject) => {
            const component = this.getComponent(id);
            if (component) {
                resolve(component);
            }
            else {
                this.addListener(id, resolve);
            }
        });
    }

    getComponent(id) {
        return this.components.get(id);
    }

    addListener(id, listener) {
        let listeners = this.listeners.get(id);
        if (!listeners) {
            listeners = [];
            this.listeners.set(id, listeners);
        }
        listeners.push(listener);
    }

    /**
     * @param {Object} lang JSON格式的文本
     */
    addLocalization(lang) {
        // TODO: deepmerge localization
    }

    /**
     * 向san-router的/addon/<id>路径下添加路由, 实现自定义页面
     * https://github.com/baidu/san-router
     *
     * @param {string} id sub route
     * @param {sanComponent} Component san component
     * @param {string} target 组件渲染容器
     */
    addRoutes(id, Component, target) {
        router.add({
            path: `/addon/${id}`,
            Component,
            target
        });
    }
};
