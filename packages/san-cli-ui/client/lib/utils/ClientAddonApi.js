/**
 * @file ClientAddonApi
 * @author zttonly
*/

import router from '../../pages/index';

export const toComponentId = id => {
    id = id.replace(/\./g, '-');
    return `client-addon--${id}`;
};

export default class ClientAddonApi {
    constructor() {
        this.components = new Map();
        this.componentListeners = new Map();
        window.components = window.components || new Map();
    }

    /**
     * Register a component globally.
     *
     * @param {string} id Component id
     * @param {Object} definition Component definition
     */
    component(id, definition) {
        this.components.set(id, definition);
        const componentId = toComponentId(id);
        window.components.set(componentId, definition);
        // eslint-disable-next-line no-console
        console.log(`[ClientAddonApi] Registered ${componentId} component`);
        // Call listeners
        const listeners = this.componentListeners.get(id);
        if (listeners) {
            listeners.forEach(l => l(definition));
            this.componentListeners.delete(id);
        }
    }

    /**
     * Add routes to san-router under a /addon/<id> parent route.
     * For example, addRoutes('foo', BookComponent,  '.app-main');
     * will add the /addon/foo/ route to san-router.
     *
     * @param {string} id Routes pack id (generally the san-cli plugin id)
     * @param {Object} component vue-router route definitions
     * @param {string} target vue-router route definitions
     */
    addRoutes(id, component, target = '') {
        router.add({
            path: `/addon/${id}`,
            Component: component,
            target,
            needProject: true,
            restore: true
        });
        // eslint-disable-next-line no-console
        console.log(`[ClientAddonApi] Registered new routes under the /addon/${id} route`);
    }

    getComponent(id) {
        return this.components.get(id);
    }

    listenForComponent(id, cb) {
        let listeners = this.componentListeners.get(id);
        if (!listeners) {
            listeners = [];
            this.componentListeners.set(id, listeners);
        }
        listeners.push(cb);
    }

    awaitComponent(id) {
        return new Promise((resolve, reject) => {
            const result = this.getComponent(id);
            if (result) {
                resolve(result);
            }
            else {
                this.listenForComponent(id, resolve);
            }
        });
    }
}
