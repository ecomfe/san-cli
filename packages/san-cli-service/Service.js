/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file Service Class
 * inspired by https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/Service.js
 */

const {resolve, isAbsolute, join, dirname} = require('path');
const EventEmitter = require('events').EventEmitter;
const {logger: consola, time, timeEnd, chalk, getDebugLogger} = require('san-cli-utils/ttyLogger');
const importLazy = require('import-lazy')(require);
const fs = require('fs-extra');
const {merge: webpackMerge} = importLazy('webpack-merge');
const defaultsDeep = require('lodash.defaultsdeep');
const lMerge = require('lodash.merge');
const dotenv = require('dotenv');
const {createChainConfig, createDevServerConfig} = require('san-cli-config-webpack');
const {normalizeProjectOptions} = require('san-cli-config-webpack/utils');
const SError = require('san-cli-utils/SError');
const {findExisting} = require('san-cli-utils/path');
const {textCommonColor} = require('san-cli-utils/color');
const argsert = require('san-cli-utils/argsert');
const readPkg = require('san-cli-utils/readPkg');
const PluginAPI = require('./PluginAPI');
const resolvePlugin = importLazy('./resolvePlugin');
const {defaults: defaultConfig, validate: validateOptions} = require('./options');
const logger = consola.withTag('Service');
const debug = getDebugLogger('service');
const showConfig = getDebugLogger('webpack:config');

module.exports = class Service extends EventEmitter {
    constructor(
        cwd,
        {
            watch = false,
            autoLoadConfigFile = true,
            plugins = [],
            useBuiltInPlugin = true,
            useDashboard = false,
            extProjectOptions = {}
        } = {}
    ) {
        super();

        // 发送CLI UI信息的IPC服务
        this.useDashboard = useDashboard;
        // watch模式，watch configfile变化
        this.useWatchMode = watch;
        // 不存在的时候，是否主动查找&加载本地的 san.config.js
        this.autoLoadConfigFile = autoLoadConfigFile;

        // 工作目录
        this.cwd = cwd || process.cwd();
        // logger
        this.logger = consola;
        // pkg
        this.pkg = readPkg(this.cwd);

        this.initialized = false;

        this._initProjectOptions = extProjectOptions;
        // webpack chain & merge array
        this.webpackChainFns = [];
        this.webpackRawConfigFns = [];
        this.devServerMiddlewares = [];
        // 插件
        this.plugins = this.resolvePlugins(plugins, useBuiltInPlugin);
    }
    loadEnv(mode) {
        const load = envPath => {
            let env = {};
            try {
                const content = fs.readFileSync(envPath);
                env = dotenv.parse(content) || {};
                debug('loadEnv envPath %s', envPath);
                debug('loadEnv env object %O', env);
            } catch (err) {
                // 文件不存在
                if (err.toString().indexOf('ENOENT') < 0) {
                    logger.error(err);
                } else {
                    return {};
                }
            }
            return env;
        };
        const merge = obj => {
            Object.keys(obj).forEach(key => {
                if (!process.env.hasOwnProperty(key)) {
                    process.env[key] = obj[key];
                }
            });
        };

        let defaultEnv = {};
        const defaultEnvPath = join(this.cwd, '.env');
        if (fs.existsSync(defaultEnvPath)) {
            defaultEnv = Object.assign(defaultEnv, load(defaultEnvPath));
        }

        // this._configDir
        // 后续为：local 内容
        const modeEnvName = `.env${mode ? `.${mode}` : ''}`;
        const envPath = findExisting([modeEnvName].map(k => join(this.cwd, k)));

        if (!envPath) {
            // 不存在默认的，则不往下执行了
            merge(defaultEnv);
            return;
        }
        const localEnvPath = `${envPath}.local`;

        const localEnv = load(localEnvPath);
        defaultEnv = Object.assign(defaultEnv, load(envPath));

        const envObj = Object.assign(defaultEnv, localEnv);
        merge(envObj);
        if (mode) {
            const defaultNodeEnv = mode === 'production' ? mode : 'development';
            // 下面属性如果为空，会根据 mode 设置的
            ['NODE_ENV', 'BABEL_ENV'].forEach(k => {
                if (!process.env[k]) {
                    process.env[k] = defaultNodeEnv;
                }
            });
        }
    }

    resolvePlugins(plugins = [], useBuiltInPlugin = true) {
        // 0. 判断是否需要加载 builtin plugin
        let builtInPlugins = [];
        if (useBuiltInPlugin) {
            // * 添加上 babel 插件
            builtInPlugins.push(require('san-cli-plugin-babel'));
        }
        plugins = Array.isArray(plugins) ? plugins : [];

        if (plugins.length) {
            // 2. 真正加载
            plugins = plugins.map(this._loadPlugin.bind(this));
            plugins = [...builtInPlugins, ...plugins];
        } else {
            plugins = builtInPlugins;
        }

        return plugins;
    }
    _loadPlugin(p) {
        let pluginOptions;
        if (Array.isArray(p) && p.length === 2) {
            // 带有参数的plugin 配置
            pluginOptions = p[1];
            p = p[0];
        }

        if (typeof p === 'string') {
            // 处理引入
            try {
                // 是从工作目录开始的
                // san cli 内部使用 require
                let plugin = require(resolvePlugin(p, this.cwd));
                if (plugin.__esModule) {
                    // 重新赋值 esmodule
                    plugin = plugin.default;
                }
                if (typeof plugin === 'object' && typeof plugin.apply === 'function') {
                    if (!plugin.id) {
                        logger.warn(`Plugin is invalid: ${p}. Service plugin must has id.`);
                        // 默认 id 是配置的 string，方便查找
                        plugin.id = p;
                    }
                    // 这里支持两种情况：
                    // 1. 普通 plugin，没有参数
                    // 2. plugin 是 array，则第二个 value 是 options
                    // 这样兼容同一个 plugin 多次调用 options 不同情况
                    if (pluginOptions) {
                        debug('Plugin loaded: %s with options %O', chalk.magenta(plugin.id), pluginOptions);
                        return [plugin, pluginOptions];
                    }
                    debug('Plugin loaded: %s', chalk.magenta(plugin.id));

                    return plugin;
                }
                logger.error(`Plugin is invalid: ${p}. Service plugin must has id and apply function!`);
            } catch (e) {
                logger.error(`Plugin load failed: ${p}`);
                logger.error(e);
            }
        } else if (typeof p === 'object' && p.id && typeof p.apply === 'function') {
            // 处理 object
            if (pluginOptions) {
                return [p, pluginOptions];
            }
            return p;
        } else if (typeof p === 'function') {
            // 如果传入的plugin是个函数，增加id
            return [{id: 'anonymous', apply: p}, pluginOptions];
        } else {
            logger.error('Service plugin is invalid');
            if (p && p.toString() === '[object Object]') {
                logger.error(p);
            }
        }
    }
    init(mode, configFile) {
        if (this.initialized) {
            // 初始化过一次之后就不需要二次了
            // 注意这里会导致 configFile 这类二次修改不会生效
            return this;
        }
        this.initialized = true;

        // 先加载 env 文件，保证 config 文件中可以用到
        time('loadEnv');
        this.loadEnv(mode);
        timeEnd('loadEnv');

        // set mode
        // load user config
        time('loadProjectOptions');
        const projectOptions = this.loadProjectOptions(configFile);
        // 下面是给 config-webpack 用的
        projectOptions.mode = mode;

        const entryFiles = Object.keys(projectOptions.pages || {}).map(key => projectOptions.pages[key].entry);
        process.env.SAN_CLI_ENTRY_FILES = JSON.stringify(entryFiles);

        debug('projectOptions: %O', projectOptions);
        timeEnd('loadProjectOptions');

        // 添加插件
        if (Array.isArray(projectOptions.plugins) && projectOptions.plugins.length) {
            projectOptions.plugins.forEach(p => this.addPlugin(p));
        }
        // 初始化插件
        this.plugins.forEach(plugin => {
            plugin && this.initPlugin(plugin);
        });
        // webpack 配置
        if (this.projectOptions.chainWebpack) {
            this.webpackChainFns.push(this.projectOptions.chainWebpack);
        }
        if (this.projectOptions.configWebpack) {
            this.webpackRawConfigFns.push(this.projectOptions.configWebpack);
        }
        return this;
    }
    _getApiInstance(id) {
        const self = this;
        return new Proxy(new PluginAPI(id, self), {
            get(target, prop) {
                // 传入配置的自定义 pluginAPI 方法
                if (['on', 'emit', 'addPlugin', 'getWebpackChainConfig', 'getWebpackConfig'].includes(prop)) {
                    if (typeof self[prop] === 'function') {
                        return self[prop].bind(self);
                    }
                    return self[prop];
                }
                return target[prop];
            }
        });
    }
    initPlugin(plugin) {
        let options = {};
        if (Array.isArray(plugin)) {
            [plugin, options] = plugin;
        }
        const {id, apply} = plugin;
        const api = this._getApiInstance(id);

        // 传入配置的 options
        // * 因为一般 plugin 不需要自定义 options，所以 projectOption 作为第二个参数
        apply(api, this.projectOptions, options);
        return this;
    }
    loadProjectOptions(configFile) {
        let originalConfigFile = configFile;
        if (configFile && typeof configFile === 'string') {
            configFile = isAbsolute(configFile) ? configFile : resolve(this.cwd, configFile);
            if (!fs.existsSync(configFile)) {
                configFile = false;
                this.logger.warn(`config file \`${originalConfigFile}\` is not exists!`);
            }
        }
        // 首先试用 argv 的 config，然后寻找默认的，找到则读取，格式失败则报错
        let config = defaultsDeep(this._initProjectOptions, defaultConfig);
        let result = {
            filepath: originalConfigFile,
            config: configFile ? require(configFile) : false
        };
        if (!configFile && this.autoLoadConfigFile) {
            // 主动查找 cwd 目录的.san
            result.filepath = findExisting(['san.config.js', '.san.config.js'], this.cwd);

            if (result.filepath) {
                // 加载 config 文件
                result.config = require(result.filepath);
            }
        }
        if (result && result.config) {
            let configPath = result.filepath;

            if (typeof result.config !== 'object') {
                logger.error(`${textCommonColor(configPath)}: Expected object type.`);
            } else {
                // 校验config.js schema 格式
                try {
                    validateOptions(result.config);
                } catch (e) {
                    logger.error(`${textCommonColor(configPath)}: Invalid type.`);
                    throw new SError(e);
                }
            }
            debug('loadProjectOptions from %s', configPath);

            // 加载默认的 config 配置
            config = defaultsDeep(result.config, config);
        } else {
            // this.logger.warn(`${textCommonColor('san.config.js')} Cannot find! Use default configuration.`);
        }
        this.projectOptions = this.normalizeConfig(config, result.filepath);
        return this.projectOptions;
    }
    normalizeConfig(config, filepath) {
        // normalize publicPath
        ensureSlash(config, 'publicPath');
        if (typeof config.publicPath === 'string') {
            config.publicPath = config.publicPath.replace(/^\.\//, '');
        }
        removeSlash(config, 'outputDir');

        // normalize pages
        const pages = config.pages;
        if (filepath && pages) {
            filepath = dirname(filepath);
            Object.keys(pages).forEach(p => {
                const page = pages[p];
                // 相对于 san.config.js
                ['entry', 'template'].forEach(key => {
                    if (page[key]) {
                        if (Array.isArray(page[key])) {
                            // 处理成相对 san.config.js
                            page[key] = page[key].map(p => (isAbsolute(p) ? p : resolve(filepath, p)));
                        } else {
                            page[key] = resolve(filepath, page[key]);
                        }
                    }
                });
            });
        }

        config.pkg = this.pkg;
        // 添加默认context
        if (!config.context) {
            config.context = this.cwd;
        }
        return config;
    }

    run(name, args = {}) {
        let mode = args.mode || process.env.NODE_ENV;
        if (!['production', 'development'].includes(mode)) {
            mode = 'development';
        }
        process.env.NODE_ENV = mode;

        // 添加 global 配置，san config.js 使用
        // global.__isProduction = mode === 'production'; // 去掉？？？

        const {noProgress, profiler, watch} = args;
        // 使用进度条, 添加progress plugin
        if (!noProgress) {
            // 名字，目前用于进度条
            const progressOptions = {
                name,
                // webpackbar 的 profiler 需要开启进度条才能使用
                profile: !!profiler
            };
            this.addPlugin(require('san-cli-plugin-progress'), progressOptions);
        }

        // 添加dashboard Plugin
        if (this.useDashboard) {
            this.addPlugin(require('san-cli-plugin-dashboard'), {
                type: name,
                keepAlive: watch
            });
        }

        // init 之后就执行了initplugin，所以在之前addPlugin
        time('init');
        this.init(mode, args.configFile);
        timeEnd('init');

        // 返回一个promise
        return Promise.resolve(this._getApiInstance(`run:${name}`));
    }

    addPlugin(name, options = {}) {
        argsert('<string|array|object> [object|undefined]', [name, options], arguments.length);

        if (Array.isArray(name)) {
            [name, options = {}] = name;
        } else if (typeof name === 'object') {
            argsert('<string> <function>', [name.id, name.apply], 2);
        }

        const plugin = this._loadPlugin([name, options]);
        this.plugins.push(plugin);
        return this;
    }

    getWebpackChainConfig() {
        const projectOptions = normalizeProjectOptions(this.projectOptions);
        const chainableConfig = createChainConfig(this.projectOptions.mode, projectOptions);
        if (this.projectOptions.extends) {
            this.projectOptions.extends.forEach(item => {
                if (typeof item === 'string') {
                    item = [item];
                }
                const [config, options] = item;
                const configPath = require.resolve(config, {
                    paths: [process.cwd()]
                });
                require(configPath)(chainableConfig, projectOptions, options);
            });
        }
        // apply chains
        this.webpackChainFns.forEach(fn => fn(chainableConfig));
        return chainableConfig;
    }

    getWebpackConfig(chainableConfig = this.getWebpackChainConfig()) {
        if (!this.initialized) {
            throw new SError('Service must call init() before calling getWebpackConfig().');
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
                    if (res.resolve && res.resolve.extensions) {
                        config.resolve.extensions = res.resolve.extensions;
                    }
                }
            } else if (fn) {
                // merge literal values
                config = webpackMerge(config, fn);
                if (fn.resolve && fn.resolve.extensions) {
                    config.resolve.extensions = fn.resolve.extensions;
                }
            }
        });

        if (config !== original) {
            cloneRuleNames(config.module && config.module.rules, original.module && original.module.rules);
        }

        // 这里需要将 devServer 和 this.projectOptions.devServer 进行 merge
        config.devServer = createDevServerConfig(
            lMerge(config.devServer || {}, this.projectOptions.devServer || {}) || {}
        );

        let before = config.devServer.before;
        if (this.devServerMiddlewares.length) {
            /* eslint-disable space-before-function-paren */
            before = (function(before, devServerMiddlewares) {
                /* eslint-enable space-before-function-paren */
                return (app, server) => {
                    // 因为一些中间件存在监听等逻辑，所以这里包了一层 fn
                    devServerMiddlewares.forEach(fn => typeof fn === 'function' && app.use(fn()));
                    // 还原配置的 before
                    typeof before === 'function' && before(app, server);
                };
            })(before, this.devServerMiddlewares);
        }
        config.devServer.before = before;
        if (debug.enabled || showConfig.enabled) {
            // 在debug模式输出
            debug(config);
            showConfig(config);
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
