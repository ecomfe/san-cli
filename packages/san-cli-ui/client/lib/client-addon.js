/**
 * @file 集成第三方组件
 * @author jinzhan
 */
import san from 'san';
import Component from '@lib/san-component';
import loadScript from 'load-script';
import apolloClient from '@lib/apollo-client';
import CLIENT_ADDONS from '@graphql/client-addon/clientAddons.gql';
import CLIENT_ADDON_ADDED from '@graphql/client-addon/clientAddonAdded.gql';
import {addLocalization} from './mixins/localization';
import uiComponents from './default-components';

export default class ClientAddon {
    constructor() {
        this.components = new Map();
        this.listeners = new Map();
        this.namespace = new Map();
    }

    /**
     * 向ClientAddon中添加组件
     *
     * @param {string} id 组件的标识
     * @param {Object} options san.defineComponent快捷定义参数，详见：https://baidu.github.io/san/doc/main-members/#Component
     */
    defineComponent(id, options, namespace) {
        // TODO: 此处也可以使用san-component
        const component = san.defineComponent({
            ...options,
            components: Object.assign({}, uiComponents, options.components || {})
        }, Component);
        this.components.set(id, component);
        namespace && this.namespace.set(id, namespace);
        // 调用组件相应的回调方法，这里可以配合awaitComponent添加回调
        const listeners = this.listeners.get(id);
        if (listeners) {
            listeners.forEach(listener => listener({component, namespace}));
            this.listeners.delete(id);
        }
    }

    /**
     * 获取id对应组件
     *
     * @param {string} id 组件的标识
     * @return {Object}
     */
    getComponent(id) {
        return this.components.get(id);
    }

    /**
     * 注册一个Promise，为后续添加的组件，注册回调方法
     *
     * @param {string} id 组件的标识
     * @return {Promise}
     */
    awaitComponent(id) {
        return new Promise((resolve, reject) => {
            const component = this.getComponent(id);
            const namespace = this.namespace.get(id);
            if (component) {
                resolve({component, namespace});
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
     * 增加第三方描述文本对象
     *
     * @param {Object} lang JSON格式的文本
     */
    addLocales(lang) {
        addLocalization(lang);
    }

    /**
     * 向san-router的/addon/<id>路径下添加路由, 实现自定义页面
     * https://github.com/baidu/san-router
     *
     * @param {string} id sub route
     * @param {sanComponent} Component san component
     * @param {string} target 组件渲染容器
     */
    // addRoutes(id, Component, target) {
    //     router.add({
    //         rule: `/addon/${id}`,
    //         Component,
    //         target
    //     });
    // }

    // TODO: 由于目前路由组件的一些局限性，先弄个简版的
    addRoutes(id, component, namespace) {
        this.defineComponent(id, component, namespace);
    }
};

/**
 * 加载第三方组件
 */
const addonMap = new Map();

// load js，并去重
const load = ({url, id}) => {
    if (addonMap.get(url)) {
        return;
    }
    addonMap.set(url, true);
    loadScript(url, (err, script) => {
        if (err) {
            addonMap.set(url, false);
            // eslint-disable-next-line no-console
            console.log(`[error]: load ${url} failed.`);
        }
        else {
            // eslint-disable-next-line no-console
            console.log('Load addon:', {url, id});
        }
    });
};

export const loadClientAddons = async () => {
    const query = await apolloClient.query({
        query: CLIENT_ADDONS
    });

    if (query.data && query.data.clientAddons) {
        query.data.clientAddons.forEach(addon => {
            load(addon);
        });
    }

    apolloClient.subscribe({
        query: CLIENT_ADDON_ADDED
    }).subscribe({
        next: result => {
            const {data, error, errors} = result;
            if (error || errors) {
                // eslint-disable-next-line no-console
                console.log('client-addon error:', error || errors);
            }
            if (data && data.clientAddonAdded) {
                load(data.clientAddonAdded);
            }
        },
        error: err => {
            // eslint-disable-next-line no-console
            console.log('error', err);
        }
    });
};
