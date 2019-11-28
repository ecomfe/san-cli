/**
 * @file Service Class
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const {resolve, isAbsolute, join} = require('path');
const EventEmitter = require('events').EventEmitter;
const {logger: consola, time, timeEnd} = require('san-cli-utils/ttyLogger');
const importLazy = require('import-lazy');
const fs = require('fs-extra');
const Config = importLazy(require)('webpack-chain');
const webpackMerge = importLazy(require)('webpack-merge');
// const cosmiconfig = require('cosmiconfig');
const defaultsDeep = require('lodash.defaultsdeep');
const lMerge = require('lodash.merge');
const dotenv = require('dotenv');

const commander = require('./commander');
const SError = require('san-cli-utils/SError');
const PluginAPI = require('./PluginAPI');
const {findExisting} = require('san-cli-utils/path');
const {textColor} = require('san-cli-utils/randomColor');
const readPkg = require('./readPkg');

const {defaults: defaultConfig, validateSync: validateOptions} = require('./options');

const BUILDIN_PLUGINS = ['base', 'css', 'app', 'optimization', 'babel'];

const logger = consola.withTag('Service');

/* global Map, Proxy */
module.exports = class Service extends EventEmitter {
    constructor(cwd, {plugins = [], useBuiltInPlugin = true, projectOptions = {}, cli = commander()} = {}) {
        super();
        this.cwd = cwd || process.cwd();
        this.logger = consola;
        this.pkg = readPkg(this.cwd);

        this.initialized = false;
        this._initProjectOptions = projectOptions;
        // webpack chain & merge array
        this.webpackChainFns = [];
        this.webpackRawConfigFns = [];
        // 相关的 Map
        // 下面是注册命令 map
        this.registeredCommands = new Map();
        // 下面是注册 command flag map
        this.registeredCommandFlags = new Map();
        this.registeredCommandHandlers = new Map();

        this._cli = cli;
        this.devServerMiddlewares = [];
        this.plugins = this.resolvePlugins(plugins, useBuiltInPlugin);
    }

    loadEnv(mode) {
        // this._configDir
        // 后续为：local 内容
        const modeEnvName = `.env${mode ? `.${mode}` : ''}`;
        const envPath = findExisting([modeEnvName].map(k => join(this.cwd, k)));
        if (!envPath) {
            // 不存在默认的，则不往下执行了
            return;
        }
        const localEnvPath = `${envPath}.local`;

        const load = envPath => {
            let env = {};
            try {
                const content = fs.readFileSync(envPath);
                env = dotenv.parse(content) || {};
                logger.debug('loadEnv', envPath, env);
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

        const localEnv = load(localEnvPath);
        const defaultEnv = load(envPath);

        const envObj = Object.assign(defaultEnv, localEnv);
        Object.keys(envObj).forEach(key => {
            if (!process.env.hasOwnProperty(key)) {
                process.env[key] = envObj[key];
            }
        });
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
            builtInPlugins = BUILDIN_PLUGINS.map(id => require(`../configs/${id}`));
        }
        plugins = Array.isArray(plugins) ? plugins : [];

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
                // 是从工作目录开始的
                // san cli 内部使用 require
                let plugin = require(resolve(this.cwd, p));
                if (plugin.__esModule) {
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
                logger.debug(e);
                throw new SError('Require plugin is valid : ' + p);
            }
        } else if (typeof p === 'object' && p.id && typeof p.apply === 'function') {
            // 处理 object
            return [p, pluginOptions];
        } else {
            if (p.toString() === '[object Object]') {
                logger.log(p);
            }
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

        this.plugins.forEach(plugin => {
            this.initPlugin(plugin);
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

                if (
                    [
                        'registerCommand',
                        'version',
                        'on',
                        'emit',
                        'registerCommandFlag',
                        'addPlugin',
                        'getWebpackChainConfig',
                        'getWebpackConfig',
                        'addDevServerMiddleware'
                    ].includes(prop)
                ) {
                    if (typeof self[prop] === 'function') {
                        return self[prop].bind(self);
                    } else {
                        return self[prop];
                    }
                } else if (['getCwd', 'getProjectOptions', 'getVersion', 'getPkg'].includes(prop)) {
                    // 将属性转换成 getXXX 模式
                    prop = prop.replace(/^get([A-Z])/, (m, $1) => $1.toLowerCase());
                    return () => self[prop];
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
        /* eslint-disable one-var */
        let command, description, builder, handler, aliases;
        /* eslint-enable one-var */
        if (typeof name === 'object') {
            command = name.command;
            description = name.describe || name.description || name.desc;
            builder = name.builder;
            handler = name.handler;
            aliases = name.aliases;
        } else {
            command = name;
            if (typeof yargsModule === 'function') {
                handler = yargsModule;
            } else {
                description = yargsModule.describe || yargsModule.description || yargsModule.desc;
                builder = yargsModule.builder;
                handler = yargsModule.handler;
                aliases = yargsModule.aliases;
            }
        }

        if (typeof handler !== 'function') {
            handler = argv => {
                logger.warn('registerCommand', `${name} has an empty handler.`);
            };
        }
        // 绑定 run，实际是通过 run 之后执行的
        const cmdName = getCommandName(command);
        this.registeredCommands.set(cmdName, {
            command,
            handler,
            aliases,
            describe: description ? description : false,
            builder: builder ? builder : {}
        });
        return this;
    }
    _registerCommand(yargsModule) {
        this._cli.command(yargsModule);
        return this;
    }
    async loadProjectOptions(configFile) {
        let originalConfigFile = configFile;
        if (configFile && typeof configFile === 'string') {
            configFile = isAbsolute(configFile) ? configFile : resolve(this.cwd, configFile);
            if (!fs.existsSync(configFile)) {
                configFile = false;
                this.logger.warn('config-file', `${originalConfigFile} is not exists!`);
            }
        }
        // 首先试用 argv 的 config，然后寻找默认的，找到则读取，格式失败则报错
        let config = defaultsDeep(this._initProjectOptions, defaultConfig);
        let result = {
            filepath: originalConfigFile,
            config: configFile ? require(configFile) : false
        };
        if (!configFile) {
            // 主动查找 cwd 目录的.san
            // // 使用 cosmiconfig 查找
            // const explorer = cosmiconfig('san', {
            //     // 寻找.san文件夹优先于 cwd
            //     searchPlaces: ['.san.config.js', 'san.config.js']
            // });
            result.filepath = findExisting(['san.config.js', '.san.config.js'], this.cwd);

            if (result.filepath) {
                // 加载 config 文件
                result.config = require(result.filepath);
            }
        }
        if (result && result.config) {
            let configPath = result.filepath;

            if (!result.config || typeof result.config !== 'object') {
                logger.error(`${textColor(configPath)}: 格式必须是对象.`);
            } else {
                // 校验config.js schema 格式
                try {
                    await validateOptions(result.config);
                } catch (e) {
                    logger.error(`${textColor(configPath)}: 格式不正确.`);
                    throw new SError(e);
                }
            }
            logger.debug('loadProjectOptions from ', configPath);
            // 这里特殊处理下 plugins 字段吧
            // if (result.config.plugins && result.config.plugins.length) {
            //     result.config.plugins = result.config.plugins.map(k =>
            //         typeof k === 'string' ? resolve(dirname(result.filepath), k) : k
            //     );
            // }

            // 加载默认的 config 配置
            config = defaultsDeep(result.config, config);
        } else {
            this.logger.warn(`${textColor('san.config.js')} Cannot find! Use default configuration.`);
        }
        // normalize publicPath
        ensureSlash(config, 'publicPath');
        if (typeof config.publicPath === 'string') {
            config.publicPath = config.publicPath.replace(/^\.\//, '');
        }
        removeSlash(config, 'outputDir');
        return config;
    }
    runCommand(cmd, rawArgs) {
        // 组装 command，然后解析执行
        // 0. registerCommand 和 registerCommandFlag 记录 command
        let handlers = this.registeredCommandHandlers.get(cmd);
        let flags = this.registeredCommandFlags.get(cmd) || {};
        /* eslint-disable fecs-camelcase */
        const _command = this.registeredCommands.get(cmd);
        /* eslint-enable fecs-camelcase */
        if (!_command) {
            // 命令不存在哦~
            logger.error('runCommand', `${this._cli.$0} ${cmd} is not exist!`);
            return this;
        }
        /* eslint-disable fecs-camelcase */
        const {command, handler: oHandler, describe, builder: oFlags, aliases} = _command;
        /* eslint-enable fecs-camelcase */
        // 0.1 处理 flags
        const builder = Object.assign(flags, oFlags || {});
        // 0.2 处理 handler
        const handler = argv => {
            if (!Array.isArray(handlers) && typeof handlers === 'function') {
                handlers = [handlers];
            }
            let doit = true;
            if (Array.isArray(handlers)) {
                for (let i = 0, len = handlers.length; i < len; i++) {
                    const handler = handlers[i];
                    if (typeof handler === 'function') {
                        doit = handler(argv);
                        // ！！！返回 false 则则停止后续操作！！！
                        if (doit === false) {
                            // 跳出循环
                            break;
                        }
                    }
                }
            }
            // waring：
            // 如果任何注入的命令 flag handler 返回为 false，则会停止后续命令执行
            // 所以这里不一定会执行，看 doit 的结果
            // 最后执行，因为插入的 flags 都是前置的函数，
            // 而注册 command 的 handler 才是主菜
            doit !== false && oHandler(argv);
        };
        // 1. cli 添加命令
        this._registerCommand({
            command,
            handler,
            describe,
            builder,
            aliases
        });
        // 2. cli.parse 解析
        if (rawArgs[0] !== cmd) {
            rawArgs.unshift(cmd);
        }
        this._cli.help().parse(rawArgs || process.argv.slice(2));
        return this;
    }

    async run(cmd, argv = {}, rawArgv = process.argv.slice(2)) {
        // eslint-disable-next-line
        let {_version: version} = argv;
        // 保证 Api.getxx 能够获取
        this.version = version;

        const mode = argv.mode || (cmd === 'build' && argv.watch ? 'development' : 'production');
        // 先加载 env 文件，保证 config 文件中可以用到
        time('loadEnv');
        this.loadEnv(mode);
        timeEnd('loadEnv');

        // set mode
        // load user config
        time('loadProjectOptions');
        const projectOptions = await this.loadProjectOptions(argv.configFile);
        logger.debug('projectOptions', projectOptions);
        timeEnd('loadProjectOptions');

        this.projectOptions = projectOptions;
        // 添加插件
        if (Array.isArray(projectOptions.plugins) && projectOptions.plugins.length) {
            projectOptions.plugins.forEach(p => this.addPlugin(p));
        }
        // 开始添加依赖 argv 的内置 plugin
        // 添加progress plugin
        if (!argv.noProgress) {
            this.addPlugin(require('../plugins/progress'), {name: cmd});
        }
        time('init');
        this.init(mode);
        timeEnd('init');

        time('runCommand');
        this.runCommand(cmd, rawArgv);
        timeEnd('runCommand');

        return this;
    }
    addPlugin(name, options = {}) {
        if (Array.isArray(name)) {
            [name, options = {}] = name;
        }
        const plugin = this._resolvePlugin([name, options]);
        this.plugins.push(plugin);
        return this;
    }
    addDevServerMiddleware(middlewares) {
        this.devServerMiddlewares.push(middlewares);
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
                }
            } else if (fn) {
                // merge literal values
                config = webpackMerge(config, fn);
            }
        });

        if (config !== original) {
            cloneRuleNames(config.module && config.module.rules, original.module && original.module.rules);
        }
        // 这里需要将 devServer 和 this.projectOptions.devServer 进行 merge
        config.devServer = lMerge(config.devServer || {}, this.projectOptions.devServer || {}) || {};
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
