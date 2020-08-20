/**
 * @file 集成第三方组件
 * @author jinzhan
 */
import san from 'san';
import Component from '@lib/san-component';
import {router} from 'san-router';
import deepmerge from 'deepmerge';
import loadScript from 'load-script';
import apolloClient from '@lib/apollo-client';
import CLIENT_ADDONS from '@graphql/client-addon/clientAddons.gql';
import CLIENT_ADDON_ADDED from '@graphql/client-addon/clientAddonAdded.gql';
import localization from '@locales/zh.json';
import uiComponents from './components';

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
        // TODO: 此处也可以使用san-component
        const component = san.defineComponent({
            ...options,
            components: Object.assign({}, uiComponents, options.components || {})
        }, Component);
        this.components.set(id, component);

        // 调用组件相应的回调方法，这里可以配合awaitComponent添加回调
        const listeners = this.listeners.get(id);
        if (listeners) {
            listeners.forEach(listener => listener(component));
            this.listeners.delete(id);
        }
    }

    getComponent(id) {
        return this.components.get(id);
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

/**
 * 加载第三方组件
 */
export const loadClientAddons = async () => {
    const query = await apolloClient.query({
        query: CLIENT_ADDONS
    });

    if (query.data && query.data.clientAddons) {
        query.data.clientAddons.forEach(addon => {
            loadScript(addon.url);
            console.log('Load addon:', addon);
        });
    }

    apolloClient.subscribe({
        query: CLIENT_ADDON_ADDED
    }).subscribe({
        next: result => {
            const {data, error, errors} = result;
            if (error || errors) {
                console.log('client-addon error:', error || errors);
            }
            if (data && data.clientAddonAdded) {
                loadScript(data.clientAddonAdded.url);
                console.log('Load data.clientAddonAdded:', data.clientAddonAdded);
            }
        },
        error: err => {
            console.log('error', err);
        }
    });
};
