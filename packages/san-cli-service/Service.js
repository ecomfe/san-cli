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
const {plugins: builtInPlugins, devServerOptions} = require('san-cli-config-webpack');
const Config = require('webpack-chain');
const SError = require('san-cli-utils/SError');
const {findExisting} = require('san-cli-utils/path');
const {textCommonColor} = require('san-cli-utils/color');
const argsert = require('san-cli-utils/argsert');
const readPkg = require('san-cli-utils/readPkg');
const {reloadModule} = require('san-cli-utils/utils');
const PluginAPI = require('./PluginAPI');
const resolvePlugin = importLazy('./resolvePlugin');
const {defaults: defaultConfig, validate: validateOptions} = require('./options');
const logger = consola.withTag('Service');
const debug = getDebugLogger('service');
const showConfig = getDebugLogger('webpack:config');
const cloneDeep = require('lodash.clonedeep');
const get = require('lodash.get');

module.exports = class Service extends EventEmitter {
    constructor(
        cwd,
        {
            watch = false,
            autoLoadConfigFile = true,
            plugins = [],
            useBuiltInPlugin = true,
            useDashboard = false,
            projectConfigs = {}
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

        this._initProjectConfigs = projectConfigs;
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

    resolvePlugins(inputPlugins = [], useBuiltInPlugin = true) {
        // 0. 判断是否需要加载 builtin plugin
        let plugins = [];
        if (useBuiltInPlugin) {
            // 1.新增内置插件
            plugins = plugins.concat(builtInPlugins);
        }
        plugins = plugins.concat(inputPlugins);

        if (plugins.length) {
            // 2. 真正加载
            plugins = plugins.map(this._loadPlugin.bind(this));
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
                const pluginPath = resolvePlugin(p, this.cwd);
                let plugin = require(pluginPath);
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
                    plugin.path = pluginPath;
                    // 这里支持两种情况：
                    // 1. 普通 plugin，没有参数
                    // 2. plugin 是 array，则第二个 value 是 options
                    // 这样兼容同一个 plugin 多次调用 options 不同情况
                    if (pluginOptions) {
                        debug('Plugin loaded: %s with options %O', chalk.magenta(plugin.id), pluginOptions);
                    }
                    else {
                        debug('Plugin loaded: %s', chalk.magenta(plugin.id));
                    }

                    return [plugin, pluginOptions];
                }
                logger.error(`Plugin is invalid: ${p}. Service plugin must has id and apply function!`);
            } catch (e) {
                logger.error(`Plugin load failed: ${p}`);
                logger.error(e);
            }
        } else if (typeof p === 'object' && p.id && typeof p.apply === 'function') {
            p.path = this.cwd;
            return [p, pluginOptions];
        } else if (typeof p === 'function') {
            // 如果传入的plugin是个函数，增加id
            return [{id: 'anonymous', apply: p, path: this.cwd}, pluginOptions];
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
        time('loadProjectConfigs');
        const projectConfigs = this.loadProjectConfigs(configFile);
        // 下面是给 config-webpack 用的
        projectConfigs.mode = mode;

        const entryFiles = Object.keys(projectConfigs.pages || {}).map(key => projectConfigs.pages[key].entry);
        process.env.SAN_CLI_ENTRY_FILES = JSON.stringify(entryFiles);

        debug('projectConfigs: %O', projectConfigs);
        timeEnd('loadProjectConfigs');

        const pluginMap = projectConfigs.extends && this.loadExt(projectConfigs.extends) || {};
        debug('pluginMap: %O', pluginMap);
        // 2. 添加san.config.js插件,优先级最高最后加载
        if (Array.isArray(projectConfigs.plugins) && projectConfigs.plugins.length) {
            projectConfigs.plugins.forEach(p => this.addPlugin(p));
        }
        // 过滤插件去掉重复，最后加载的插件和插件配置生效
        this.filterPlugin(pluginMap);
        // 3. 初始化插件
        this.plugins.forEach(plugin => this.initPlugin(plugin));
        // webpack 配置
        if (this.projectConfigs.chainWebpack) {
            this.webpackChainFns.push(this.projectConfigs.chainWebpack);
        }
        if (this.projectConfigs.configWebpack) {
            this.webpackRawConfigFns.push(this.projectConfigs.configWebpack);
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
    /**
     * 加载扩展的配置
     * @param {any} extConfigs san.config.js内的extends扩展项
     * @returns {object}
     * extends扩展的配置4种格式:
     * 1. 单一配置文件地址, 可以填入绝对路径或相对路径: 'san-cli-config-xx'
     * 2. 数组内多个配置文件: ['san-cli-config-x1', 'san-cli-config-x2']
     * 3. 数组内除配置文件外还增加插件的开关控制对象: [['san-cli-config-xx', {mypluginId: false}]]
     * 4. 数组内直接传入扩展的对象: [[{plugins: 'path/to/file'}, {mypluginId: false}]]
     */
    loadExt(extConfigs) {
        if (!(typeof extConfigs === 'string' || Array.isArray(extConfigs))) {
            return;
        }
        // plugins的总开关
        const pluginMap = {};
        // 加载plguin顺序是：默认plugin + extends plugin + 当前san.config.js plugin，优先级也如此顺序
        // 1. 扩展配置
        let tmpPath = {};
        if (typeof extConfigs === 'string') {
            extConfigs = [extConfigs];
        }
        let result = [];
        // 加载extends并去重，最后加载的配置有效
        for (let i = extConfigs.length - 1; i >= 0; i--) {
            let e = extConfigs[i];
            let options = {};
            if (Array.isArray(e) && e.length === 2) {
                [e, options] = e;
            }

            let extOptions = null;
            if (typeof e === 'string') {
                let configPath = '';
                try {
                    if (isAbsolute(e)) {
                        configPath = require.resolve(e);
                    }
                    else {
                        // 查找当前工程下和当前工程下的node_modules
                        try {
                            configPath = require.resolve(join(this.cwd, e));
                        } catch (err) {
                            configPath = require.resolve(join(this.cwd + '/node_modules/', e));
                        }
                    }
                } catch (err) {
                    logger.error(`Extends config: ${e} not exist!`);
                    throw new SError(err);
                }

                // 路径存在，且未被加载
                if (!tmpPath[configPath]) {
                    tmpPath[configPath] = true;
                    try {
                        extOptions = reloadModule(configPath);
                    }
                    catch (err) {
                        logger.error(`Extends file: ${configPath} load fail!`, err);
                    }
                }
                else {
                    logger.warn(`Extends file: ${configPath} is discarded due to duplication. option: ${
                        JSON.stringify(options)}`);
                }
            }
            else if (typeof e === 'object' && e.plugins) {
                extOptions = e;
            }
            else {
                logger.error('Extends is invalid', e);
            }
            // 没有拿到配置则跳过
            if (!extOptions) {
                continue;
            }
            result.unshift([extOptions, options]);
        }
        // 配置合并到this.projectConfigs内
        result.forEach(c => {
            // 合并开关控制
            Object.assign(pluginMap, c[1]);
            const plugins = c[0].plugins;
            // 删除plugins
            delete c[0].plugins;
            // 扩展plugins
            plugins.forEach(p => this.addPlugin(p));
            // 合并其余配置项
            defaultsDeep(this.projectConfigs, c[0]);
        });
        return pluginMap;
    }
    filterPlugin(pluginMap) {
        // 只存储开启的plugin, 并去重
        const oriPlugins = this.plugins;
        this.plugins = [];
        const loadMap = {};
        for (let i = oriPlugins.length - 1; i >= 0; i--) {
            let [p, pOptions = {}] = oriPlugins[i];
            if (pluginMap[p.id] !== false) {
                if (!loadMap[p.id]) {
                    loadMap[p.id] = true;
                    // extends中的插件optons优先级高于插件自身定义的options
                    const extendOptions = typeof pluginMap[p.id] === 'object' ? pluginMap[p.id] : {};
                    pOptions = defaultsDeep(extendOptions, pOptions);
                    this.plugins.unshift([p, pOptions]);
                }
                else {
                    logger.warn(`Plugin id: ${p.id} is discarded due to duplication. path: ${
                        p.path}. options: ${JSON.stringify(pOptions)}`);
                }
            }
        }
    }
    initPlugin(p) {
        const [plugin, pluginOptions] = p;
        const {id, apply, pickConfig} = plugin;
        // 拿到projectConfigs内插件对应的配置项
        const api = this._getApiInstance(id);
        const options = pickConfig ? defineOption(this.projectConfigs, api, pickConfig) : {};

        apply(api, defaultsDeep(pluginOptions, options));
        return this;
    }
    loadProjectConfigs(configFile) {
        let originalConfigFile = configFile;
        if (configFile && typeof configFile === 'string') {
            configFile = isAbsolute(configFile) ? configFile : resolve(this.cwd, configFile);
            if (!fs.existsSync(configFile)) {
                configFile = false;
                this.logger.warn(`config file \`${originalConfigFile}\` is not exists!`);
            }
        }
        // 首先试用 argv 的 config，然后寻找默认的，找到则读取，格式失败则报错
        let config = defaultsDeep(this._initProjectConfigs, defaultConfig);
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

            debug('loadProjectConfigs from %s', configPath);

            // 加载默认的 config 配置
            config = defaultsDeep(result.config, config);
        } else {
            // this.logger.warn(`${textCommonColor('san.config.js')} Cannot find! Use default configuration.`);
        }
        // 防止创建多个service实例时出现config相互影响
        this.projectConfigs = cloneDeep(this.normalizeConfig(config, result.filepath));
        return this.projectConfigs;
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
        const chainableConfig = new Config();
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

        // 这里需要将 devServer 和 this.projectConfigs.devServer 进行 merge
        config.devServer = lMerge(
            devServerOptions,
            config.devServer || {},
            this.projectConfigs.devServer || {}
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

function defineOption(config, api, pickConfig) {
    const res = {};
    if (!(Array.isArray(pickConfig)
        || typeof pickConfig === 'object'
        || typeof pickConfig === 'function'
    )) {
        logger.error('Service pickConfig type error: mapper must be either an Array or an Object or a function');
        return;
    }
    if (typeof pickConfig === 'function') {
        pickConfig = pickConfig(config, api);
    }
    const getter = Array.isArray(pickConfig)
        ? pickConfig.map(key => ({key, val: key}))
        : Object.keys(pickConfig).map(key => ({key, val: pickConfig[key]}));

    getter.forEach(({key, val}) => {
        res[key] = get(config, val);
    });
    return res;
}
