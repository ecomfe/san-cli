/**
 * @file PluginApi
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/api/PluginApi.js
 */
const path = require('path');
// Connectors
// Utils
const ipc = require('../utils/ipc');
const sharedData = require('../connectors/sharedData');
const {matchesPluginId} = require('san-cli-utils/plugin');
// Validators
// const {validateConfiguration} = require('./configuration');

class PluginApi {
    constructor({plugins, file, project, lightMode = false}, context) {
        // Context
        this.context = context;
        this.pluginId = null;
        this.project = project;
        this.plugins = plugins;
        this.cwd = file;
        // Hooks
        this.hooks = {
            projectOpen: [],
            pluginReload: [],
            configRead: [],
            configWrite: []
        };
        // Data
        this.configurations = [];
        this.actions = new Map();
        this.ipcHandlers = [];
        this.widgetDefs = [];
        this.clientAddons = [];
    }

    /**
     * Register an handler called when the project is open (only if this plugin is loaded).
     *
     * @param {Function} cb Handler
     */
    onProjectOpen(cb) {
        if (this.project) {
            cb(this.project);
            return;
        }
        this.hooks.projectOpen.push(cb);
    }

    /**
     * Register an handler called when the plugin is reloaded.
     *
     * @param {Function} cb Handler
     */
    onPluginReload(cb) {
        this.hooks.pluginReload.push(cb);
    }

    /**
     * Register an handler called when a config is red.
     *
     * @param {Function} cb Handler
     */
    onConfigRead(cb) {
        this.hooks.configRead.push(cb);
    }

    /**
     * Register an handler called when a config is written.
     *
     * @param {Function} cb Handler
     */
    onConfigWrite(cb) {
        this.hooks.configWrite.push(cb);
    }

    /**
     * Describe a project configuration (usually for config file like `.eslintrc.json`).
     *
     * @param {Object} options Configuration description
     */
    describeConfig(options) {
        try {
            // validateConfiguration(options);
            this.configurations.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error(new Error(`Invalid options: ${e.message}`));
        }
    }

    // IPC

    /**
     * Add a listener to the IPC messages.
     *
     * @param {Function} cb Callback with 'data' param
     * @return {Function}
     */
    ipcOn(cb) {
        const handler = cb._handler = ({data, emit}) => {
            if (data._projectId) {
                if (data._projectId !== this.project.id) {
                    return;
                }
                data = data._data;
            }
            cb({data, emit});
        };
        this.ipcHandlers.push(handler);
        return ipc.on(handler);
    }

    /**
     * Remove a listener for IPC messages.
     *
     * @param {any} cb Callback to be removed
     */
    ipcOff(cb) {
        const handler = cb._handler;
        if (!handler) {
            return;
        }
        const index = this.ipcHandlers.indexOf(handler);
        if (index !== -1) {
            this.ipcHandlers.splice(index, 1);
        }
        ipc.off(handler);
    }

    /**
     * Send an IPC message to all connected IPC clients.
     *
     * @param {any} data Message data
     */
    ipcSend(data) {
        ipc.send(data);
    }

    /**
     * Get the local DB instance (lowdb)
     *
     * @readonly
     */
    get db() {
        return this.context.db;
    }

    /**
     * Indicates if a specific plugin is used by the project
     *
     * @param {string} id Plugin id or short id
     * @return {boolean}
     */
    hasPlugin(id) {
        return this.plugins.some(p => matchesPluginId(id, p.id));
    }

    /**
     * Get current working directory.
     *
     * @return {string}
     */
    getCwd() {
        return this.cwd;
    }

    /**
     * Resolves a file relative to current working directory
     *
     * @param {string} file Path to file relative to project
     * @return {string}
     */
    resolve(file) {
        return path.resolve(this.cwd, file);
    }

    /**
     * Get currently open project
     *
     * @return {string}
     */
    getProject() {
        return this.project;
    }

    /* Namespaced */

    /**
     * Retrieve a value from the local DB
     *
     * @param {string} id Path to the item
     * @return {Object} Item value
     */
    storageGet(id) {
        return this.db.get(id).value();
    }

    /**
     * Store a value into the local DB
     *
     * @param {string} id Path to the item
     * @param {any} value Value to be stored (must be serializable in JSON)
     */
    storageSet(id, value) {
        this.db.set(id, value).write();
    }

    /**
   * Register a client addon (a JS bundle which will be loaded in the browser).
   * Used to load components and add vue-router routes.
   *
   * @param {Object} options Client addon options
   *   {
   *     id: string,
   *     url: string
   *   }
   *   or
   *   {
   *     id: string,
   *     path: string
   *   }
   */
    addClientAddon(options) {
        try {
            if (options.url && options.path) {
                throw new Error('\'url\' and \'path\' can\'t be defined at the same time.');
            }
            this.clientAddons.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error(new Error(`Invalid options: ${e.message}`));
        }
    }

    /**
   * Register a widget for project dashboard
   *
   * @param {Object} def Widget definition
   */
    registerWidget(def) {
        try {
            this.widgetDefs.push({
                ...def,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error(new Error(`Invalid definition: ${e.message}`));
        }
    }

    /**
     * Listener triggered when a Plugin action is called from a client addon component.
     *
     * @param {string} id Id of the action to listen
     * @param {any} cb Callback (ex: (params) => {} )
     */
    onAction(id, cb) {
        let list = this.actions.get(id);
        if (!list) {
            list = [];
        }
        list.push(cb);
        this.actions.set(id, list);
    }

    /**
     * Call a Plugin action. This can also listened by client addon components.
     *
     * @param {string} id Id of the action
     * @param {Object} params Params object passed as 1st argument to callbacks
     * @return {Promise}
     */
    callAction(id, params) {
        const plugins = require('../connectors/plugins');
        return plugins.callAction({id, params}, this.context);
    }

    /**
     * Retrieve a Shared data instance.
     *
     * @param {string} id Id of the Shared data
     * @return {SharedData} Shared data instance
     */
    getSharedData(id) {
        return sharedData.get({id, projectId: this.project.id}, this.context);
    }

    /**
     * Set or update the value of a Shared data
     *
     * @param {string} id Id of the Shared data
     * @param {any} value Value of the Shared data
     * @param {SetSharedDataOptions} options options
     * @return {Function}
     */
    async setSharedData(id, value, {disk = false} = {}) {
        return sharedData.set({id, projectId: this.project.id, value, disk}, this.context);
    }

    /**
     * Delete a shared data.
     *
     * @param {string} id Id of the Shared data
     * @return {Function}
     */
    async removeSharedData(id) {
        return sharedData.remove({id, projectId: this.project.id}, this.context);
    }

    /**
     * Watch for a value change of a shared data
     *
     * @param {string} id Id of the Shared data
     * @param {Function} handler Callback
     */
    watchSharedData(id, handler) {
        sharedData.watch({id, projectId: this.project.id}, handler);
    }

    /**
     * Delete the watcher of a shared data.
     *
     * @param {string} id Id of the Shared data
     * @param {Function} handler Callback
     */
    unwatchSharedData(id, handler) {
        sharedData.unwatch({id, projectId: this.project.id}, handler);
    }

    /**
     * Create a namespaced version of:
     *   - registerWidget
     *
     * @param {string} namespace Prefix to add to the id params
     * @return {Object}
    */
    namespace(namespace) {
        let that = this;
        return {
            registerWidget(def) {
                def.id = namespace + def.id;
                return that.registerWidget(def);
            },

            /**
             * Listener triggered when a Plugin action is called from a client addon component.
             *
             * @param {string} id Id of the action to listen
             * @param {any} cb Callback (ex: (params) => {} )
             * @return {Function}
             */
            onAction(id, cb) {
                return that.onAction(namespace + id, cb);
            },

            /**
             * Call a Plugin action. This can also listened by client addon components.
             *
             * @param {string} id Id of the action
             * @param {Object} params Params object passed as 1st argument to callbacks
             * @return {Promise}
             */
            callAction(id, params) {
                return this.callAction(namespace + id, params);
            },

            /**
             * Retrieve a Shared data instance.
             *
             * @param {string} id Id of the Shared data
             * @return {SharedData} Shared data instance
             */
            getSharedData(id) {
                return this.getSharedData(namespace + id);
            },

            /**
             * Set or update the value of a Shared data
             *
             * @param {string} id Id of the Shared data
             * @param {any} value Value of the Shared data
             * @param {SetSharedDataOptions} options options
             */
            setSharedData(id, value, options) {
                this.setSharedData(namespace + id, value, options);
            },

            /**
             * Delete a shared data.
             *
             * @param {string} id Id of the Shared data
             */
            removeSharedData(id) {
                this.removeSharedData(namespace + id);
            },

            /**
             * Watch for a value change of a shared data
             *
             * @param {string} id Id of the Shared data
             * @param {Function} handler Callback
             */
            watchSharedData(id, handler) {
                this.watchSharedData(namespace + id, handler);
            },

            /**
             * Delete the watcher of a shared data.
             *
             * @param {string} id Id of the Shared data
             * @param {Function} handler Callback
             */
            unwatchSharedData(id, handler) {
                this.unwatchSharedData(namespace + id, handler);
            }
        };
    }
}

module.exports = PluginApi;
