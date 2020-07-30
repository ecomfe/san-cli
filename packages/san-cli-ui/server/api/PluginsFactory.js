/**
 * @file CLI UI插件是一个庞大的类，这里将通过职责不同进行拆分
 * @author jinzhan
 */

const path = require('path');
const {matchesPluginId} = require('san-cli-utils/plugin');
const ipc = require('../utils/ipc');
const sharedData = require('../connectors/sharedData');
const notify = require('../utils/notify');

/**
 * 对lowdb进行简单的封装，
 * 目的是减少set/get的.value()和.write()这层调用
*/
class DB {
    /**
     * @param {Object} db lowddb的实例
     * @param {string} namespace 获取一个带命名空间的操作实例
    */
    constructor(db, namespace = '') {
        this.db = db;
        this.namespace = namespace;
    }
    get(key) {
        return this.db.get(this.namespace + key).value();
    }
    set(key, value) {
        this.db.set(this.namespace + key, value).write();
        return this.db;
    }
}

/**
 * 对sharedData的封装
 */

class SharedData {
    constructor(sharedData, {project, context}) {
        this.sharedData = sharedData;
        this.project = project;
        this.context = context;
    }

    /**
     * 设置sharedData中的数据
     *
     * @param {string} id sharedData的id
     * @param {any} value 通常是json
     * @param {Object} options options
     */
    async set(id, value, {disk = false} = {}) {
        return this.sharedData.set({
            id,
            projectId: this.project.id,
            value,
            disk
        }, this.context);
    }

    /**
     * 获取sharedData中的数据
     *
     * @param {string} id sharedData的id
     */
    get(id) {
        return this.sharedData.get({
            id,
            projectId: this.project.id
        }, this.context);
    }

    /**
     * 清除sharedData中的数据
     *
     * @param {string} id sharedData的id
     * @return {Function}
     */
    async remove(id) {
        return this.sharedData.remove({
            id,
            projectId: this.project.id
        }, this.context);
    }

    /**
     * 监听sharedData的变化
     *
     * @param {string} id sharedData的id
     * @param {Function} handler Callback
     */
    watch(id, handler) {
        this.sharedData.watch({
            id,
            projectId: this.project.id
        }, handler);
    }

    /**
     * 清除sharedData的监听
     *
     * @param {string} id sharedData的id
     * @param {Function} handler Callback
     */
    unwatch(id, handler) {
        this.sharedData.unwatch({
            id,
            projectId: this.project.id
        }, handler);
    }
}

/**
 * Plugin的基础方法，各种类型的plugin都需要的，集合到基类里面
*/
class Plugin {
    constructor({cwd, pluginId, project}, context) {
        this.pluginId = pluginId;
        this.project = project;
        this.$db = this.context.db;
        this.context = context;
        // Hooks
        this.hooks = {
            projectOpen: [],
            pluginReload: []
        };
        // Data
        this.actions = new Map();
        this.ipcHandlers = [];
    }

    /**
     * 注册一个初始化的方法
     *
     * @param {Function} cb Callback Handler
     */
    onProjectOpen(cb) {
        if (this.project) {
            cb(this.project);
            return;
        }
        this.hooks.projectOpen.push(cb);
    }

    /**
     * 插件reload的时候回调
     *
     * @param {Function} cb Handler
     */
    onPluginReload(cb) {
        this.hooks.pluginReload.push(cb);
    }

    /**
     * 往IpcMessenger里面添加listener
     *
     * @param {Function} callback 可以带参数的回调方法
     * @return {Function}
     */
    ipcOn(callback) {
        const handler = ({data, emit}) => {
            if (data.$projectId) {
                if (data.$projectId !== this.project.id) {
                    return;
                }
                data = data.$data;
            }
            callback({data, emit});
        };
        callback.$handler = handler;
        this.ipcHandlers.push(handler);
        return ipc.on(handler);
    }

    /**
     * 清除IpcMessenger里面的listener
     *
     * @param {any} callback 要清除的callback，参数同ipcOn
     */
    ipcOff(callback) {
        const handler = callback.$handler;
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
     * 向连接的所有的IPC客户端发送消息
     *
     * @param {any} data Message data
     */
    ipcSend(data) {
        ipc.send(data);
    }

    // 获取当前环境路径
    getCwd() {
        return this.cwd;
    }

    /**
     * resolve相对于当前工作环境的路径
     *
     * @param {string} file 相对于当前project的路径
     * @return {string}
     */
    resolve(file) {
        return path.resolve(this.cwd, file);
    }

    /**
     * 获取当前项目信息
     *
     * @return {string}
     */
    getProject() {
        return this.project;
    }

    /**
     * 获取可以操作lowdb的实例对象
     *
     * @param {string} id key或路径
     * @return {DB} 能操作db的DB类的实例
     */
    getDB(namespace) {
        if (typeof namespace !== 'string') {
            namespace = '';
        }
        return new DB(this.$db, namespace);
    }

    /**
     * 添加前端组件可触发的action方法
     *
     * @param {string} id action的id
     * @param {any} callback 回调方法
     */
    onAction(id, callback) {
        let list = this.actions.get(id);
        if (!list) {
            list = [];
        }
        list.push(callback);
        this.actions.set(id, list);
    }

    /**
     * 触发action中的方法
     *
     * @param {string} id action的id
     * @param {Object} params action方法的参数
     * @return {Promise}
     */
    callAction(id, params) {
        const plugins = require('../connectors/plugins');
        return plugins.callAction({id, params}, this.context);
    }

    /**
     * 获取sharedData中的数据
     *
     * @param {string} id sharedData的id
     */
    getSharedData() {
        return new SharedData(sharedData, {
            project: this.project,
            context: this.context
        });
    }

    /**
     * 发起一个桌面通知
     * @param {Object} options 通知选项
     */
    notify(options) {
        try {
            // TODO: validate notify options
            notify(options);
        }
        catch (e) {
            // errlog
        }
    }

    /**
     * 判断项目之中是否包含某个plugin
     *
     * @param {string} id Plugin id or short id
     */
    hasPlugin(id) {
        return this.plugins.some(p => matchesPluginId(id, p.id));
    }
};

class TaskPlugin {
    constructor() {
        this.tasks = [];
        this.hooks = {
            taskRun: [],
            taskExit: [],
            taskOpen: []
        };
    }

    /**
     * 注册一个任务
     *
     * @param {object} options Task信息
     */
    registerTask(options) {
        try {
            // TODO: to validate task
            // validate(options);
            this.tasks.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // TODO: invalidate task
            // error(e);
        }
    }

    /**
     * 根据script的命令，找到一个描述型的task
     *
     * @param {string} command package.json中的script command
     * @returns {object} task
     */
    getTask(command) {
        // return this.tasks.find(xxx);
    }

    onTaskRun(callback) {
        this.hooks.taskRun.push(callback);
    }

    onTaskExit(callback) {
        this.hooks.taskExit.push(callback);
    }

    onTaskOpen(callback) {
        this.hooks.taskOpen.push(callback);
    }
};

class ViewPlugin {
    constructor() {
        this.hooks = {
            viewOpen: []
        };
        // Data
        this.clientAddons = [];
        this.views = [];
    }
    /**
     * 注册一个自定义的路由
    */
    requestRoute(route) {
        // TODO: requestRoute(route, this.context);
    }
    /**
     * 打开视图时候的回调
     *
     * @param {function} cb Handler
     */
    onViewOpen(cb) {
        if (this.lightMode) {
            return;
        }

        this.hooks.viewOpen.push(cb);
    }

    addView(options) {
        try {
            // validateView(options);
            this.views.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // errlog
        }
    }

    addClientAddon(options) {
        try {
            // validateClientAddon(options);
            if (options.url && options.path) {
                throw new Error('[url] and [path] can\'t be defined at the same time.');
            }
            this.clientAddons.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // errlog()
        }
    }
};

class ConfigPlugin {
    constructor() {
        this.hooks = {
            configRead: [],
            configWrite: []
        };
        this.configurations = [];
    }

    registerConfig(options) {
        try {
            // validateConfiguration(options);
            this.configurations.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // errorLog
        }
    }
    /**
     * 配置被打开的时候回调
     * @param {Function} cb Handler
    */
    onConfigRead(cb) {
        this.hooks.configRead.push(cb);
    }

    /**
     * 配置文件被落盘的时候回调
     * @param {Function} cb Handler
    */
    onConfigWrite(cb) {
        this.hooks.configWrite.push(cb);
    }
};

class WidgetPlugin {
    constructor() {
        this.widgets = [];
    }

    /**
     * 添加一个widget到仪表盘
     *
     * @param {object} def Widget definition
     */
    registerWidget(options) {
        try {
            // validate Widget options
            this.widgets.push({
                ...options,
                pluginId: this.pluginId
            });
        }
        catch (e) {
            // errorlog
        }
    }
};

/**
 * 创建一个Plugin的单例，并按需初始化
*/
const PluginFactory = (function () {
    let instance = null;
    return {
        // 初始化Plugin的实例
        getInstance(options) {
            if (!instance) {
                instance = new Plugin(...options);
                // instance.constructor = null;
            }
            return instance;
        },

        reset() {
            if (instance) {
                instance.taskPlugin = null;
                instance.viewPlugin = null;
                instance.configPlugin = null;
                instance.widgetPlugin = null;
                instance = null;
            }
        },

        // 注册任务插件：taskPlugin
        registerTask(...args) {
            if (!instance.taskPlugin) {
                const taskPlugin = new TaskPlugin(...args);
                instance.taskPlugin = taskPlugin;
            }
            instance.taskPlugin.registerTask(...args);
            return instance.taskPlugin;
        },

        // 注册视图插件：viewPlugin
        registerView(...args) {
            if (!instance.viewPlugin) {
                const viewPlugin = new ViewPlugin(...args);
                instance.viewPlugin = viewPlugin;
            }
            instance.viewPlugin.registerView(...args);
            return instance.viewPlugin;
        },

        // 注册配置插件：configPlugin
        registerConfig(...args) {
            if (!instance.configPlugin) {
                const configPlugin = new ConfigPlugin(...args);
                instance.configPlugin = configPlugin;
            }
            instance.configPlugin.registerConfig(...args);
            return instance.configPlugin;
        },

        // 注册仪表盘widget插件：configPlugin
        registerWidget(...args) {
            if (!instance.widgetPlugin) {
                const widgetPlugin = new WidgetPlugin(...args);
                instance.widgetPlugin = widgetPlugin;
            }
            instance.widgetPlugin.registerWidget(...args);
            return instance.widgetPlugin;
        }
    };
})();

// 方法只读，避免被篡改
Object.freeze(PluginFactory);

module.exports = PluginFactory;