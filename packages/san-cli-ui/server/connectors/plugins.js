/**
 * @file plugins
 * @author jinzhan, zttonly
 */
const path = require('path');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const {reloadModule} = require('../utils/module');
const PluginManager = require('../api/PluginManager');
const cwd = require('./cwd');
const widgets = require('./widgets');
const dependencies = require('./dependencies');
const clientAddons = require('./clientAddons');
const sharedData = require('./sharedData');
const {readPackage} = require('../utils/fileHelper');
const getContext = require('../utils/context');
const {isPlugin, getPluginLink} = require('../utils/plugin');
const projects = require('./projects');
const views = require('./views');
const debug = getDebugLogger('ui:plugins');

const SAN_CLI = 'san-cli';

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
        debug('callHook:', {id, args, file});
        const fns = pluginApi.hooks[id] || [];
        debug(`Hook ${id}`, fns.length, 'handlers');
        fns.forEach(fn => fn(...args));
    }

    findPlugins(deps, file) {
        return Object.keys(deps).filter(
            id => isPlugin(id)
        ).map(
            id => ({
                id,
                versionRange: deps[id],
                official: isPlugin(id),
                installed: dependencies.isInstalled(id),
                website: getPluginLink(id),
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
            let p = id.indexOf('/') === 0 ? `${id}/${filename}` : `${pluginApi.cwd}/node_modules/${id}/${filename}`;
            module = reloadModule(p);
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
        return new Promise(async (resolve, reject) => {
            debug('Reseting Plugin API...', file);
            let pluginApi = this.pluginApiInstances.get(file);
            let projectId;

            if (pluginApi) {
                projectId = pluginApi.project.id;
                const ipc = pluginApi.getIpc();
                ipc.handlers.forEach(fn => ipc.off(fn));
            }

            if (projectId) {
                sharedData.unwatchAll(projectId);
            }

            // 清空上一个项目的插件
            clientAddons.clear(context);

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

            // 添加addons
            if (pluginApi.addonPlugin && pluginApi.addonPlugin.addons) {
                pluginApi.addonPlugin.addons.forEach(options => {
                    clientAddons.add(options, context);
                });
            }

            // 添加视图
            getDebugLogger('ui:views')('pluginApi.viewPlugin', pluginApi.viewPlugin);

            if (pluginApi.viewPlugin && pluginApi.viewPlugin.views) {
                for (const view of pluginApi.viewPlugin.views) {
                    await views.add({view, project}, context);
                }
            }

            // 添加仪表盘插件
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

            // call view open hook
            const currentView = views.getCurrent();

            debug('currentView', currentView);

            if (currentView) {
                views.open(currentView.id);
            }

            widgets.load(context);

            resolve(true);
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
        const index = plugins.findIndex(p => p.id === SAN_CLI);

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
