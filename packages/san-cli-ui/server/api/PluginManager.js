/**
 * @file CLI UI插件是一个庞大的类，这里将通过职责不同进行拆分
 * @author jinzhan
 */

const path = require('path');
const {matchesPluginId} = require('san-cli-utils/plugin');
const {log, error} = require('san-cli-utils/ttyLogger');
const ipc = require('../utils/ipc');
const notify = require('../utils/notify');
const DB = require('./DB');
const SharedData = require('./SharedData');
const TaskPlugin = require('./TaskPlugin');
const ViewPlugin = require('./ViewPlugin');
const ConfigPlugin = require('./ConfigPlugin');
const WidgetPlugin = require('./WidgetPlugin');
const {
    PLUGIN_ACTION_CALLED,
    PLUGIN_ACTION_RESOLVED
} = require('../utils/channels');

/**
 * Plugin的基础方法，各种类型的plugin都需要的，集合到基类里面
*/
class PluginManager {
    constructor({cwd, project}, context) {
        this.cwd = cwd;
        this.project = project;
        this.context = context;

        this.pluginId = null;
        this.$db = this.context.db;

        // Hooks
        this.hooks = {
            projectOpen: [],
            pluginReload: []
        };

        // Data
        this.actions = new Map();
        this.ipcHandlers = [];

        this.taskPlugin = null;
        this.viewPlugin = null;
        this.configPlugin = null;
        this.widgetPlugin = null;
    }

    // 注册任务插件：taskPlugin
    registerTask(...args) {
        if (!this.taskPlugin) {
            this.taskPlugin = new TaskPlugin(...args);
        }
        this.taskPlugin.registerTask(...args);
        return this.taskPlugin;
    }

    // 注册视图插件：viewPlugin
    registerView(...args) {
        if (!this.viewPlugin) {
            this.viewPlugin = new ViewPlugin(...args);
        }
        this.viewPlugin.registerView(...args);
        return this.viewPlugin;
    }

    // 注册配置插件：configPlugin
    registerConfig(...args) {
        if (!this.configPlugin) {
            this.configPlugin = new ConfigPlugin(...args);
        }
        this.configPlugin.registerConfig(...args);
        return this.configPlugin;
    }

    // 注册仪表盘widget插件：configPlugin
    registerWidget(...args) {
        if (!this.widgetPlugin) {
            this.widgetPlugin = new WidgetPlugin(...args);
        }
        this.widgetPlugin.registerWidget(...args);
        return this.widgetPlugin;
    }

    /**
     * 注册一个初始化的方法
     *
     * @param {Function} callback Callback Handler
     */
    onProjectOpen(callback) {
        if (this.project) {
            callback(this.project);
            return;
        }
        this.hooks.projectOpen.push(callback);
    }

    /**
     * 插件reload的时候回调
     *
     * @param {Function} callback Handler
     */
    onPluginReload(callback) {
        this.hooks.pluginReload.push(callback);
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
    async callAction(id, params) {
        this.context.pubsub.publish(PLUGIN_ACTION_CALLED, {
            pluginActionCalled: {id, params}
        });

        log('PluginAction Called', id, params);
        const results = [];
        const errors = [];
        const actions = this.actions.get(id);
        if (actions) {
            for (const callback of actions) {
                let result = null;
                let err = null;
                try {
                    result = await callback(params);
                }
                catch (e) {
                    err = e;
                    error(e);
                }
                results.push(result);
                errors.push(err);
            }
        }
        const output = {
            id,
            params,
            results,
            errors
        };

        this.context.pubsub.publish(PLUGIN_ACTION_RESOLVED, {
            pluginActionResolved: output
        });

        log('PluginAction Resolved', output);

        return output;
    }

    /**
     * 获取sharedData中的数据
     *
     * @param {string} id sharedData的id
     */
    getSharedData() {
        return new SharedData({
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

module.exports = PluginManager;
