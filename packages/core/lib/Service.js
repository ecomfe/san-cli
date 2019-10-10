/**
 * @file Service Class
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// const fs = require('fs');
// const {resolve, isAbsolute} = require('path');

const EventEmitter = require('events').EventEmitter;

const Config = require('webpack-chain');
const webpackMerge = require('webpack-merge');
const yargs = require('yargs/yargs');

const HError = require('./HError');
const argsert = require('../argsert');
const PluginAPI = require('./PluginAPI');
const {chalk, error, warn} = require('../ttyLogger');

const BUILDIN_PLUGINS = ['../configs'];
/* global Map, Proxy */
module.exports = class Service extends EventEmitter {
    constructor(cwd, {plugins, useBuiltInPlugin = true, cli = yargs()} = {}) {
        super();
        this.cwd = cwd || process.cwd();
        this.initialized = false;
        // webpack chain & merge array
        this.webpackChainFns = [];
        this.webpackRawConfigFns = [];
        this.devServerConfigFns = [];
        this.cli = cli;

        // 相关的 Map
        this.commands = new Map();
        this.pluginMethods = new Map();

        this._servicePlugins = plugins || [];
        this._useBuiltInPlugin = useBuiltInPlugin;
    }
    resolvePlugins(plugins, useBuiltInPlugin = true) {
        // 0. 判断是否需要加载 buildin plugin
        // 1. 加载 plugins

        return this;
    }
    init(mode) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.mode = mode;
        // load user config
        const projectOptions = this.loadProjectOptions();
        this.projectOptions = projectOptions;

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
    }
    initPlugin({id, apply}) {
        const self = this;
        const api = new Proxy(new PluginAPI(id, this), {
            get(target, prop) {
                // 传入配置的自定义 pluginAPI 方法
                const pluginMethod = self.pluginMethods.get(prop);
                if (pluginMethod) {
                    return pluginMethod;
                }

                if (['registerCommand', 'version', 'on', 'emit'].includes(prop)) {
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
        apply(api, this.projectOptions);
        return this;
    }
    registerCommand(name, yargsCommand) {
        argsert('<string|<object> [function|object]', [name, yargsCommand], arguments.length);
        /* eslint-disable one-var */
        let command, description, builder, handler, middlewares;
        /* eslint-enable one-var */
        if (typeof name === 'object') {
            command = name.command;
            description = name.description;
            builder = name.builder;
            handler = name.handler;
            middlewares = name.middlewares;
        } else {
            if (typeof yargsCommand === 'function') {
                handler = yargsCommand;
            } else {
                description = yargsCommand.description;
                builder = yargsCommand.builder;
                handler = yargsCommand.handler;
                middlewares = yargsCommand.middlewares;
            }
        }

        if (typeof yargsCommand.handler !== 'function') {
        }

        const run = this.run.bind(this, name);
        this._registerCommand(command, run, description, builder, middlewares);

        this.commands.set(name, handler);
        return this;
    }
    _registerCommand(command, handler, description, builder, middlewares) {
        argsert(
            '<string> <function> [string|boolean] [function|object] [array]',
            [command, handler, description, builder, middlewares],
            arguments.length
        );
        this.cli.command(command, description, builder, handler, middlewares);
        return this;
    }
    loadProjectOptions() {
        // 首先试用 argv 的 config，然后寻找默认的，找到则读取，格式失败则报错
    }
    runCommand(cmd, rawArgs) {
        this._getExistsCommand(cmd);
        this.cli.parse(rawArgs || process.argv.slice(2));
        return this;
    }
    _getExistsCommand(cmd) {
        let command = this.commands.get(cmd);
        if (!command && cmd) {
            error(`command "${this.cli.$0} ${cmd}" does not exist.`);
            process.exit(1);
        }
        return command;
    }
    async run(cmd, argv) {
        this.argv = argv;
        // eslint-disable-next-line
        let {_version: version, _logger: logger} = argv;
        this.version = version;
        this.logger = logger;

        const mode = argv.mode || (cmd === 'build' && argv.watch ? 'development' : 'production');

        this.init(mode);

        this._getExistsCommand(cmd)(argv);
    }

    resolveChainableWebpackConfig() {
        const chainableConfig = new Config();
        // apply chains
        this.webpackChainFns.forEach(fn => fn(chainableConfig));
        return chainableConfig;
    }

    resolveWebpackConfig(chainableConfig = this.resolveChainableWebpackConfig()) {
        if (!this.initialized) {
            throw new HError('Service must call init() before calling resolveWebpackConfig().');
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
            throw new HError(
                'Do not modify webpack output.publicPath directly. ' +
                    'Use the "publicPath" option in hulk.config.js instead.'
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
