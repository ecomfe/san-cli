/**
 * @file To get/set cwd，base on process.cwd()
 *
 * Reference: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-ui/apollo-server/connectors/cwd.js
 */
const path = require('path');
const {
    isPlugin,
    isOfficialPlugin,
    getPluginLink
} = require('san-cli-utils/plugin');

const ipc = require('../utils/ipc');
const PluginApi = require('../api/PluginApi');
const pluginApiInstances = new Map();
const pkgStore = new Map();
const pluginsStore = new Map();
const CLI_SERVICE = 'san-cli-service';

const folders = require('./folders');
const cwd = require('./cwd');

const getApi = folder => {
    return pluginApiInstances.get(folder);
};
const callHook = ({id, args, file}, context) => {
    const pluginApi = getApi(file);
    if (!pluginApi) {
        return;
    }
    const fns = pluginApi.hooks[id];
    console.log(`Hook ${id}`, fns.length, 'handlers');
    fns.forEach(fn => fn(...args));
};

const findPlugins = (deps, file) => {
    return Object.keys(deps).filter(
        id => isPlugin(id) || id === CLI_SERVICE
    ).map(
        id => ({
            id,
            versionRange: deps[id],
            official: isOfficialPlugin(id) || id === CLI_SERVICE,
            installed: false,
            website: id === CLI_SERVICE ? 'https://ecomfe.github.io/san-cli' : getPluginLink(id),
            baseDir: file
        })
    );
};

const getPlugins = file => {
    const plugins = pluginsStore.get(file);
    if (!plugins) {
        return [];
    }
    return plugins;
};

const runPluginApi = (id, pluginApi, context, filename = 'ui') => {
    const name = filename !== 'ui' ? `${id}/${filename}` : id;

    let module;
    try {
        module = require(`${id}/${filename}`);
    } catch (e) {
        if (process.env.SAN_CLI_DEBUG) {
            console.error(e);
        }
    }

    if (module) {
        if (typeof module !== 'function') {
            console.log('ERROR while loading plugin API: no function exported, for', name, pluginApi.cwd);
        }
        else {
            pluginApi.pluginId = id;
            try {
                module(pluginApi);
                console.log('Plugin API loaded for', name, pluginApi.cwd);
            } catch (e) {
                console.log('ERROR while loading plugin API for ${name}:', e);
            }
            pluginApi.pluginId = null;
        }
    }
};
const resetPluginApi = ({file}, context) => {
    return new Promise((resolve, reject) => {
        console.log('Plugin API reloading...', file);

        let pluginApi = pluginApiInstances.get(file);
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
            const plugins = getPlugins(file);

            pluginApi = new PluginApi({
                plugins,
                file,
                project
            }, context);
            // console.log('!!!set:', pluginApi);
            pluginApiInstances.set(file, pluginApi);

            // Run Plugin API
            runPluginApi(path.resolve(__dirname, '../../'), pluginApi, context, 'defaults');
            plugins.forEach(plugin => runPluginApi(plugin.id, pluginApi, context));
            // Local plugins

            if (projectId !== project.id) {
                callHook({
                    id: 'projectOpen',
                    args: [project, projects.getLast(context)],
                    file
                }, context);
            } else {
                callHook({
                    id: 'pluginReload',
                    args: [project],
                    file
                }, context);
            }

            resolve(true);
        });
    });
};
const list = async (file, context, {resetApi = true, autoLoadApi = true} = {}) => {
    let pkg = folders.readPackage(file, context);
    let pkgContext = cwd.get();

    pkgStore.set(file, {pkgContext, pkg});

    let plugins = [];
    plugins = plugins.concat(findPlugins(pkg.devDependencies || {}, file));
    plugins = plugins.concat(findPlugins(pkg.dependencies || {}, file));
    // console.log('!!!!plugins:', plugins)
    // Put cli service at the top
    const index = plugins.findIndex(p => p.id === CLI_SERVICE);
    if (index !== -1) {
        const service = plugins.splice(index, 1);
        plugins.unshift(service[0]);
    }

    pluginsStore.set(file, plugins);

    console.log('Plugins found:', plugins.length, file);

    if (resetApi || (autoLoadApi && !pluginApiInstances.has(file))) {
        await resetPluginApi({file}, context);
    }
    return plugins;
};

module.exports = {
    getApi,
    list,
    callHook
};
