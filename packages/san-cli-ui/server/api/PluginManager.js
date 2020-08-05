/**
 * @file CLI UI插件是一个庞大的类，这里将通过职责不同进行拆分
 * @author jinzhan
 */

const path = require('path');
const {matchesPluginId} = require('san-cli-utils/plugin');
const {getDebugLogger, error} = require('san-cli-utils/ttyLogger');
const notify = require('../utils/notify');
const DB = require('./DB');
const SharedData = require('./SharedData');
const IpcHandler = require('./IpcHandler');
const TaskPlugin = require('./TaskPlugin');
const ViewPlugin = require('./ViewPlugin');
const ConfigPlugin = require('./ConfigPlugin');
const WidgetPlugin = require('./WidgetPlugin');
const AddonPlugin = require('./AddonPlugin');
const {
    PLUGIN_ACTION_CALLED,
    PLUGIN_ACTION_RESOLVED
} = require('../utils/channels');

const debug = getDebugLogger('ui:PluginManager');
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
        this.hooks = {
            projectOpen: [],
            pluginReload: []
        };
        this.actions = new Map();
        this.taskPlugin = null;
        this.viewPlugin = null;
        this.configPlugin = null;
        this.widgetPlugin = null;
        this.addonPlugin = null;
    }

    // 注册任务插件：taskPlugin
    registerTask(...args) {
        if (!this.taskPlugin) {
            this.taskPlugin = new TaskPlugin(...args);
        }
        this.taskPlugin.register(...args);
        return this.taskPlugin;
    }

    // 注册视图插件：viewPlugin
    registerView(...args) {
        if (!this.viewPlugin) {
            this.viewPlugin = new ViewPlugin(...args);
        }
        this.viewPlugin.register(...args);
        return this.viewPlugin;
    }

    // 注册视图插件：viewPlugin
    registerAddon(...args) {
        if (!this.addonPlugin) {
            this.addonPlugin = new AddonPlugin(...args);
        }
        this.addonPlugin.register(...args);
        return this.addonPlugin;
    }

    // 注册配置插件：configPlugin
    registerConfig(...args) {
        if (!this.configPlugin) {
            this.configPlugin = new ConfigPlugin(...args);
        }
        this.configPlugin.register(...args);
        return this.configPlugin;
    }

    // 注册仪表盘widget插件：widgetPlugin
    registerWidget(...args) {
        if (!this.widgetPlugin) {
            this.widgetPlugin = new WidgetPlugin(...args);
        }
        this.widgetPlugin.register(...args);
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
     * @param {string} namespace db的路径，例如：test.
     * @return {DB} 能操作db的DB类的实例
     */
    getDB(namespace) {
        if (typeof namespace !== 'string') {
            namespace = '';
        }
        return new DB(this.$db, namespace);
    }

    /**
     * 获取sharedData的实例
     *
     * @param {string} namespace sharedData的namespace
     */
    getSharedData(namespace) {
        if (typeof namespace !== 'string') {
            namespace = '';
        }
        return new SharedData({
            project: this.project,
            context: this.context,
            namespace
        });
    }

    /**
     * 获取可以操作ipc的实例对象
     * @return {Object}
     */
    getIpc() {
        if (!this.ipcHandler) {
            this.ipcHandler = new IpcHandler();
        }
        return this.ipcHandler;
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

        debug('PluginAction Called', id, params);
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

        debug('PluginAction Resolved', output);

        return output;
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
