/**
 * @file plugins
 * @author jinzhan
 */
const path = require('path');
const {
    isPlugin,
    isOfficialPlugin,
    getPluginLink
} = require('san-cli-utils/plugin');
const {log, getDebugLogger} = require('san-cli-utils/ttyLogger');
const ipc = require('../utils/ipc');
const PluginApi = require('../api/PluginApi');
const cwd = require('./cwd');
const {readPackage} = require('../utils/fileHelper');
const debug = getDebugLogger('ui:plugins');

const CLI_SAN = 'san';

class Plugins {
    constructor() {
        this.pluginApiInstances = new Map();
        this.pkgStore = new Map();
        this.pluginsStore = new Map();
    }
    getApi(folder) {
        return this.pluginApiInstances.get(folder);
    }

    callHook({id, args, file}, context) {
        const pluginApi = this.getApi(file);
        if (!pluginApi) {
            return;
        }
        const fns = pluginApi.hooks[id] || [];
        log(`Hook ${id}`, fns.length, 'handlers');
        fns.forEach(fn => fn(...args));
    }

    findPlugins(deps, file) {
        return Object.keys(deps).filter(
            id => isPlugin(id) || id === CLI_SAN
        ).map(
            id => ({
                id,
                versionRange: deps[id],
                official: isOfficialPlugin(id) || id === CLI_SAN,
                installed: false,
                website: id === CLI_SAN ? 'https://ecomfe.github.io/san-cli' : getPluginLink(id),
                baseDir: file
            })
        );
    }

    getPlugins(file) {
        const plugins = this.pluginsStore.get(file);
        if (!plugins) {
            return [];
        }
        return plugins;
    }

    runPluginApi(id, pluginApi, context, filename = 'ui') {
        const name = filename !== 'ui' ? `${id}/${filename}` : id;
        let module;
        try {
            module = require(`${id}/${filename}`);
        }
        catch (e) {
            debug(e);
        }

        if (module) {
            if (typeof module !== 'function') {
                log('ERROR while loading plugin API: no function exported, for', name, pluginApi.cwd);
            }
            else {
                pluginApi.pluginId = id;
                try {
                    module(pluginApi);
                    log('Plugin API loaded for', name, pluginApi.cwd);
                }
                catch (e) {
                    log('ERROR while loading plugin API for ${name}:', e);
                }
                pluginApi.pluginId = null;
            }
        }
    }

    resetPluginApi({file}, context) {
        return new Promise((resolve, reject) => {
            log('Plugin API reloading...', file);
            let pluginApi = this.pluginApiInstances.get(file);
            let projectId;

            // Clean up
            if (pluginApi) {
                projectId = pluginApi.project.id;
                pluginApi.ipcHandlers.forEach(fn => ipc.off(fn));
            }

            // Cyclic dependency with projects connector
            setTimeout(async () => {
                const projects = require('./projects');
                const project = projects.findByPath(file, context);
                if (!project) {
                    resolve(false);
                    return;
                }
                if (project && projects.getType(project, context) !== 'san') {
                    resolve(false);
                    return;
                }
                const plugins = this.getPlugins(file);

                pluginApi = new PluginApi({
                    plugins,
                    file,
                    project
                }, context);

                this.pluginApiInstances.set(file, pluginApi);

                // Run Plugin API
                this.runPluginApi(path.resolve(__dirname, '../../'), pluginApi, context, 'defaults');
                plugins.forEach(plugin => this.runPluginApi(plugin.id, pluginApi, context));

                // Local plugins
                if (projectId !== project.id) {
                    this.callHook({
                        id: 'projectOpen',
                        args: [project, projects.getLast(context)],
                        file
                    }, context);
                }
                else {
                    this.callHook({
                        id: 'pluginReload',
                        args: [project],
                        file
                    }, context);
                }
                resolve(true);
            });
        });
    }

    async list(file, context, {resetApi = true, autoLoadApi = true} = {}) {
        let pkg = readPackage(file, context);
        let pkgContext = cwd.get();
        this.pkgStore.set(file, {pkgContext, pkg});
        let plugins = [];
        plugins = plugins.concat(this.findPlugins(pkg.devDependencies || {}, file));
        plugins = plugins.concat(this.findPlugins(pkg.dependencies || {}, file));

        // cli放在最上面
        const index = plugins.findIndex(p => p.id === CLI_SAN);
        if (index !== -1) {
            const service = plugins.splice(index, 1);
            plugins.unshift(service[0]);
        }

        this.pluginsStore.set(file, plugins);
        log('Plugins found:', plugins.length, file);
        if (resetApi || (autoLoadApi && !this.pluginApiInstances.has(file))) {
            await this.resetPluginApi({file}, context);
        }
        return plugins;
    }

    findOne({id, file}, context) {
        const plugins = this.getPlugins(file);
        const plugin = plugins.find(p => p.id === id);
        if (!plugin) {
            log('Plugin Not found', id, file);
        }
        return plugin;
    }
};

module.exports = new Plugins();