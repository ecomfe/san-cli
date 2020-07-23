/**
 * @file ClientAddonApi
 * @author zttonly
*/
import san from 'san';
import router from '../../pages/index';


export default class ClientAddonApi {
    constructor() {
        this.components = new Map();
        this.componentListeners = new Map();
    }

    /**
     * Register a component globally.
     *
     * @param {string} id Component id
     * @param {Object} definition Component definition
     */
    component(id, definition) {
        const definitionCom = san.defineComponent(definition);
        this.components.set(id, definitionCom);
        // eslint-disable-next-line no-console
        console.log(`[ClientAddonApi] Registered ${id} component`);
        // Call listeners
        const listeners = this.componentListeners.get(id);
        if (listeners) {
            listeners.forEach(l => l(definitionCom));
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
