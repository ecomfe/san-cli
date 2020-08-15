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
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const PluginManager = require('../api/PluginManager');
const cwd = require('./cwd');
const widgets = require('./widgets');
const dependencies = require('./dependencies');
const clientAddons = require('./clientAddons');
const {readPackage} = require('../utils/fileHelper');
const getContext = require('../utils/context');
const debug = getDebugLogger('ui:plugins');

const CLI_SAN = 'san-cli';

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
        debug(`Hook ${id}`, fns.length, 'handlers');
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
            // debug(e);
        }

        if (module) {
            if (typeof module !== 'function') {
                debug('ERROR while loading plugin API: no function exported, for', name, pluginApi.cwd);
            }
            else {
                pluginApi.pluginId = id;
                try {
                    module(pluginApi);
                    debug('Plugin API loaded for', name, pluginApi.cwd);
                }
                catch (e) {
                    debug('ERROR while loading plugin API for ${name}:', e);
                }
                pluginApi.pluginId = null;
            }
        }
    }

    resetPluginApi({file}, context) {
        return new Promise((resolve, reject) => {
            debug('Reseting Plugin API...', file);
            let pluginApi = this.pluginApiInstances.get(file);
            let projectId;

            if (pluginApi) {
                projectId = pluginApi.project.id;
                const ipc = pluginApi.getIpc();
                ipc.handlers.forEach(fn => ipc.off(fn));
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

                pluginApi = new PluginManager({
                    plugins,
                    cwd: file,
                    project
                }, context);

                this.pluginApiInstances.set(file, pluginApi);

                // 运行默认插件的API
                this.runPluginApi(path.resolve(__dirname, '../../'), pluginApi, context, 'plugins');

                // 运行第三方插件的API
                plugins.forEach(plugin => this.runPluginApi(plugin.id, pluginApi, context));

                if (pluginApi.addonPlugin && pluginApi.addonPlugin.addons) {
                    pluginApi.addonPlugin.addons.forEach(options => {
                        clientAddons.add(options, context);
                    });
                }

                // debug('pluginApi.widgetPlugin.widgets:', pluginApi.widgetPlugin && pluginApi.widgetPlugin.widgets);
                if (pluginApi.widgetPlugin && pluginApi.widgetPlugin.widgets) {
                    for (const definition of pluginApi.widgetPlugin.widgets) {
                        await widgets.registerDefinition({definition, project}, context);
                    }
                }

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

                widgets.load(context);

                resolve(true);
            });
        });
    }

    async list(file, context, {resetApi = true, autoLoadApi = true} = {}) {
        const pkg = readPackage(file, context);
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
        debug('Plugins found:', plugins.length, file);
        debug('CLI-Plugins:', plugins);
        debug(`
            autoLoadApi:${autoLoadApi}
            resetApi: ${resetApi}
            this.pluginApiInstances.has(file):${this.pluginApiInstances.has(file)}
        `);
        if (resetApi || (autoLoadApi && !this.pluginApiInstances.has(file))) {
            await this.resetPluginApi({file}, context);
        }
        return plugins;
    }

    findOne({id, file}, context) {
        const plugins = this.getPlugins(file);
        const plugin = plugins.find(p => p.id === id);
        if (!plugin) {
            debug('Plugin Not found', id, file);
        }
        return plugin;
    }

    serve(req, res) {
        const {id: pluginId, 0: file} = req.params;
        this.serveFile({pluginId, file: path.join('public', file)}, res);
    }

    serveFile({pluginId, projectId = null, file}, res) {
        let baseFile = cwd.get();
        if (projectId) {
            const projects = require('./projects');
            const project = projects.findOne(projectId, getContext());
            if (project) {
                baseFile = project.path;
            }
        }

        if (pluginId) {
            const basePath = pluginId === '.' ? baseFile
                : dependencies.getPath({id: decodeURIComponent(pluginId), file: baseFile});
            if (basePath) {
                res.sendFile(path.join(basePath, file));
                return;
            }
        }
        else {
            console.log('serve issue', 'pluginId:', pluginId, 'projectId:', projectId, 'file:', file);
        }

        res.status(404);
        res.send(`Addon ${pluginId} not found in loaded addons.`);
    }

    async callAction({id, params, file = cwd.get()}, context) {
        const pluginApi = this.pluginApiInstances.get(file);
        return pluginApi.callAction(id, params);
    }
}

module.exports = new Plugins();
