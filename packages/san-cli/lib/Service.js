/**
 * @file Service Class
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {join, resolve, isAbsolute} = require('path');
const EventEmitter = require('events').EventEmitter;

const fs = require('fs-extra');
const Config = require('webpack-chain');
const webpackMerge = require('webpack-merge');
const cosmiconfig = require('cosmiconfig');
const defaultsDeep = require('lodash.defaultsdeep');

const {findExisting} = require('./utils');
const commander = require('./commander');
const SError = require('./SError');
const argsert = require('./argsert');
const PluginAPI = require('./PluginAPI');
const {chalk, error, warn} = require('./ttyLogger');
const {defaults: defaultConfig, validateSync: validateOptions} = require('./options');

const BUILDIN_PLUGINS = ['base', 'css', 'app', 'optimization'];
/* global Map, Proxy */
module.exports = class Service extends EventEmitter {
    constructor(cwd, {plugins = [], useBuiltInPlugin = true, projectOptions = {}, cli = commander()} = {}) {
        super();
        this.cwd = cwd || process.cwd();
        this.initialized = false;
        this._initProjectOptions = projectOptions;
        // webpack chain & merge array
        this.webpackChainFns = [];
        this.webpackRawConfigFns = [];
        this.devServerConfigFns = [];
        // 相关的 Map
        this.pluginMethods = new Map();
        // 下面是注册命令 map
        this.registeredCommands = new Map();
        // 下面是注册 command flag map
        this.registeredCommandFlags = new Map();
        this.registeredCommandHandlers = new Map();

        this._cli = cli;
        this.plugins = this.resolvePlugins(plugins, useBuiltInPlugin);
    }
    // TODO: 完成它
    loadEnv() {
        // this._configDir
    }
    resolvePlugins(plugins = [], useBuiltInPlugin = true) {
        // 0. 判断是否需要加载 builtin plugin
        let builtInPlugins = [];
        if (useBuiltInPlugin) {
            builtInPlugins = BUILDIN_PLUGINS.map(id => require(`../configs/${id}`));
        }
        plugins = Array.isArray(plugins) ? plugins : [];
        let rcPlugins = this._rc.plugins;
        // 1. 添加 rc 文件中的 plugins
        if (rcPlugins && Array.isArray(rcPlugins)) {
            plugins = [...plugins, ...rcPlugins];
        }
        if (plugins.length) {
            // 2. 真正加载
            plugins = plugins.map(this._resolvePlugin);
            plugins = [...builtInPlugins, ...plugins];
        } else {
            plugins = builtInPlugins;
        }

        return plugins;
    }
    _resolvePlugin(p) {
        let pluginOptions;
        if (Array.isArray(p) && p.length === 2) {
            // 带有参数的plugin 配置
            pluginOptions = p[1];
            p = p[0];
        }
        if (typeof p === 'string') {
            // 处理引入
            try {
                let plugin = require(p);
                if (plugin.default) {
                    // 重新赋值 esmodule
                    plugin = plugin.default;
                }
                if (typeof plugin === 'object' && typeof plugin.apply === 'function') {
                    if (!plugin.id) {
                        // 默认 id 是配置的string，方便查找
                        plugin.id = p;
                    }
                    // 这里支持两种情况：
                    // 1. 普通 plugin，没有参数
                    // 2. plugin 是 array，则第二个 value 是 options
                    // 这样兼容同一个 plugin 多次调用 options 不同情况
                    if (pluginOptions) {
                        return [plugin, pluginOptions];
                    }
                    return plugin;
                } else {
                    throw new SError('Plugin is valid : ' + p);
                }
            } catch (e) {
                throw new SError('Require plugin is valid : ' + p);
            }
        } else if (typeof p === 'object' && p.id && typeof p.apply === 'function') {
            // 处理 object
            return p;
        } else {
            // 写明白这里是需要 id 的
            throw new SError('Plugin is valid : ' + p);
        }
    }
    init(mode) {
        if (this.initialized) {
            // 初始化过一次之后就不需要二次了
            // 注意这里会导致 configFile 这类二次修改不会生效
            return this;
        }
        this.initialized = true;
        this.mode = mode;
        this.loadEnv();

        this.plugins.forEach(plugin => {
            this.initPlugin(plugin);
        });
        // apply webpack configs from project config file
        if (this.projectOptions.chainWebpack) {
            this.webpackChainFns.push(this.projectOptions.chainWebpack);
        }
        if (this.projectOptions.configureWebpack) {
            this.webpackRawConfigFns.push(this.projectOptions.configureWebpack);
        }
        return this;
    }
    initPlugin(plugin) {
        let options = {};
        if (Array.isArray(plugin)) {
            options = plugin[1];
            plugin = plugin[0];
        }
        const {id, apply} = plugin;
        const self = this;
        const api = new Proxy(new PluginAPI(id, this), {
            get(target, prop) {
                // 传入配置的自定义 pluginAPI 方法
                const pluginMethod = self.pluginMethods.get(prop);
                if (pluginMethod) {
                    return pluginMethod;
                }

                if (['registerCommand', 'version', 'on', 'emit', 'registerCommandFlag', 'addPlugin'].includes(prop)) {
                    if (typeof self[prop] === 'function') {
                        return self[prop].bind(self);
                    } else {
                        return self[prop];
                    }
                } else if (['getLogger', 'getCwd', 'getProjectOptions', 'getVersion'].includes(prop)) {
                    // 将属性转换成 getXXX 模式
                    prop = prop.replace(/^get([A-Z])/, (m, $1) => $1.toLowerCase());
                    return self[prop];
                } else {
                    return target[prop];
                }
            }
        });
        // 传入配置的 options
        // 因为一般 plugin 不需要自定义 options，所以 projectOption 作为第二个参数
        apply(api, this.projectOptions, options);
        return this;
    }
    registerCommandFlag(cmdName, flag, handler) {
        argsert('<string> <object> <function>', [cmdName, flag, handler], arguments.length);
        cmdName = getCommandName(cmdName);
        const flagMap = this.registeredCommandFlags;
        let flags = flagMap.get(cmdName) || {};
        flags = Object.assign(flags, flag);
        flagMap.set(cmdName, flags);
        const handlerMap = this.registeredCommandHandlers;
        const handlers = handlerMap.get(cmdName) || [];
        handlers.push(handler);
        handlerMap.set(cmdName, handlers);
        return this;
    }
    registerCommand(name, yargsModule) {
        argsert('<string|<object> [function|object]', [name, yargsModule], arguments.length);
        /* eslint-disable one-var */
        let command, description, builder, handler, middlewares;
        /* eslint-enable one-var */
        if (typeof name === 'object') {
            command = name.command;
            description = name.description || name.desc;
            builder = name.builder;
            handler = name.handler;
            middlewares = name.middlewares;
        } else {
            command = name;
            if (typeof yargsModule === 'function') {
                handler = yargsModule;
            } else {
                description = yargsModule.description || yargsModule.desc;
                builder = yargsModule.builder;
                handler = yargsModule.handler;
                middlewares = yargsModule.middlewares;
            }
        }

        if (typeof handler !== 'function') {
            handler = argv => {
                warn(`${name} has an empty handler.`);
            };
        }
        // 绑定 run，实际是通过 run 之后执行的
        const cmdName = getCommandName(command);
        this.registeredCommands.set(cmdName, {
            command,
            handler,
            description: description ? description : false,
            builder: builder ? builder : {},
            middlewares: middlewares ? middlewares : []
        });
        return this;
    }
    _registerCommand(command, handler, description, builder, middlewares) {
        argsert(
            '<string> <function> [string|boolean] [object|function] [array]',
            [command, handler, description, builder, middlewares],
            arguments.length
        );
        this._cli.command(command, description, builder, handler, middlewares);
        return this;
    }
    async loadProjectOptions(configFile = 'san.config.js') {
        // 首先试用 argv 的 config，然后寻找默认的，找到则读取，格式失败则报错
        let config = defaultsDeep(this._initProjectOptions, defaultConfig);
        let configPath;

        // 使用 cosmiconfig 查找
        const explorer = cosmiconfig('san', {
            // 寻找.san文件夹优先于 cwd
            searchPlaces: ['.san/config.js', 'san.config.js']
        });
        const result = explorer.searchSync(this.cwd) || {};
        if (result) {
            configPath = result.filepath;

            if (!result.config || typeof result.config !== 'object') {
                error(`${chalk.bold(configPath)}: 格式必须是对象.`);
            } else {
                // 校验config.js schema 格式
                try {
                    await validateOptions(result.config);
                } catch (e) {
                    error(`${chalk.bold(configPath)}: 格式不正确.`);
                    throw new SError(e);
                }
            }

            // 加载默认的 config 配置
            config = defaultsDeep(result.config, config);
        } else {
            warn(`${chalk.bold('san.config.js')} Cannot find! Use default config.`);
        }

        // normalize some options
        ensureSlash(config, 'baseUrl');
        if (typeof config.baseUrl === 'string') {
            config.config = config.baseUrl.replace(/^\.\//, '');
        }
        removeSlash(config, 'outputDir');
        return config;
    }
    runCommand(cmd, rawArgs) {
        // 组装 command，然后解析执行
        // 0. registerCommand 和 registerCommandFlag 记录 command
        const handlers = this.registeredCommandHandlers.get(cmd);
        let flags = this.registeredCommandFlags.get(cmd) || {};
        /* eslint-disable fecs-camelcase */
        const _command = this.registeredCommands.get(cmd);
        /* eslint-enable fecs-camelcase */
        if (!_command) {
            // 命令不存在哦~
            error(`${this._cli.$0} ${cmd} is not exist!`);
            return this;
        }
        /* eslint-disable fecs-camelcase */
        const {command, handler: oHandler, description, builder: oFlags, middlewares} = _command;
        /* eslint-enable fecs-camelcase */
        // 0.1 处理 flags
        const builder = Object.assign(flags, oFlags || {});
        // 0.2 处理 handler
        const handler = argv => {
            if (Array.isArray(handlers)) {
                handlers.forEach(handler => typeof handler === 'function' && handler(argv));
            } else if (typeof handlers === 'function') {
                handlers(argv);
            }
            // 最后执行，因为插入的 flags 都是前置的函数，
            // 而注册 command 的 handler 才是主菜
            oHandler(argv);
        };
        // 1. cli 添加命令
        this._registerCommand(command, handler, description, builder, middlewares);
        // 2. cli.parse 解析
        if (rawArgs[0] !== cmd) {
            rawArgs.unshift(cmd);
        }
        this._cli.help().parse(rawArgs || process.argv.slice(2));
        return this;
    }

    async run(cmd, argv = {}, rawArgv = process.argv.slice(2)) {
        // eslint-disable-next-line
        let {_version: version, _logger: logger} = argv;
        this.version = version;
        this.logger = logger;

        const mode = argv.mode || (cmd === 'build' && argv.watch ? 'development' : 'production');
        // set mode
        // load user config
        const projectOptions = await this.loadProjectOptions(argv.configFile);
        logger.info('options', projectOptions);
        this.projectOptions = projectOptions;

        // 开始添加依赖 argv 的内置 plugin
        // 添加progress plugin
        if (!argv.noProgress) {
            this.addPlugin('../plugins/progress');
        }
        this.init(mode);
        this.runCommand(cmd, rawArgv);
        return this;
    }
    addPlugin(name, options = {}) {
        const plugin = this._resolvePlugin([name, options]);
        this.plugins.push(plugin);
        return this;
    }

    resolveChainableWebpackConfig() {
        const chainableConfig = new Config();
        // apply chains
        this.webpackChainFns.forEach(fn => fn(chainableConfig));
        return chainableConfig;
    }

    resolveWebpackConfig(chainableConfig = this.resolveChainableWebpackConfig()) {
        if (!this.initialized) {
            throw new SError('Service must call init() before calling resolveWebpackConfig().');
        }
        // get raw config
        let config = chainableConfig.toConfig();
        const original = config;
        // apply raw config fns
        this.webpackRawConfigFns.forEach(fn => {
            if (typeof fn === 'function') {
                // function with optional return value
                const res = fn(config);
                if (res) {
                    config = webpackMerge(config, res);
                }
            } else if (fn) {
                // merge literal values
                config = webpackMerge(config, fn);
            }
        });

        // #2206 If config is merged by merge-webpack, it discards the __ruleNames
        // information injected by webpack-chain. Restore the info so that
        // vue inspect works properly. (hulk inspect)
        if (config !== original) {
            cloneRuleNames(config.module && config.module.rules, original.module && original.module.rules);
        }
        // check if the user has manually mutated output.publicPath
        if (config.output.publicPath !== this.projectOptions.publicPath) {
            /* eslint-disable operator-linebreak */
            throw new SError(
                'Do not modify webpack output.publicPath directly. ' +
                    'Use the "publicPath" option in san.config.js instead.'
            );
            /* eslint-enable operator-linebreak */
        }

        return config;
    }
};

function cloneRuleNames(to, from) {
    if (!to || !from) {
        return;
    }
    from.forEach((r, i) => {
        if (to[i]) {
            Object.defineProperty(to[i], '__ruleNames', {
                value: r.__ruleNames
            });
            cloneRuleNames(to[i].oneOf, r.oneOf);
        }
    });
}

function removeSlash(config, key) {
    if (typeof config[key] === 'string') {
        config[key] = config[key].replace(/\/$/g, '');
    }
}
function ensureSlash(config, key) {
    let val = config[key];
    if (typeof val === 'string') {
        if (!/^https?:/.test(val)) {
            val = val.replace(/^([^/.])/, '/$1');
        }
        config[key] = val.replace(/([^/])$/, '$1/');
    }
}

function getCommandName(command) {
    return command
        .replace(/\s{2,}/g, ' ')
        .split(/\s+(?![^[]*]|[^<]*>)/)[0]
        .trim();
}
