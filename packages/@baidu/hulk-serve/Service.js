/**
 * @file 简版Service
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const Config = require('webpack-chain');
const merge = require('webpack-merge');
const PluginAPI = require('./PluginAPI');
const {error, isPlugin} = require('@baidu/hulk-utils');
const defaultsDeep = require('lodash.defaultsdeep');
const defaults = require('./options');

module.exports = class Service {
    constructor(context, {plugins, pkg, useBuiltIn, projectOptions} = {}) {
        this.initialized = false;
        this.projectOptions = projectOptions;
        this.pkg = pkg || {};
        this.pkgContext = context;
        this.commands = {};
        this.context = context;

        this.webpackChainFns = [];
        this.webpackRawConfigFns = [];
        this.devServerConfigFns = [];
        this.plugins = this.resolvePlugins(plugins, useBuiltIn);
        this.modes = this.plugins.reduce((modes, {apply: {defaultModes}}) => {
            return Object.assign(modes, defaultModes);
        }, {});
    }
    init(mode) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.mode = mode;
        this.projectOptions = defaultsDeep({}, defaults());
        // apply plugins.
        this.plugins.forEach(({id, apply}) => {
            apply(new PluginAPI(id, this), this.projectOptions);
        });
    }
    async run(name, args = {}, rawArgv = []) {
        // debugger;
        const mode = args.mode || (name === 'build' && args.watch ? 'development' : this.modes[name]);
        // load env variables, load user config, apply plugins
        this.init(mode);

        args._ = args._ || [];
        let command = this.commands[name];
        if (!command && name) {
            error(`command "${name}" does not exist.`);
            process.exit(1);
        }
        if (!command || args.help) {
            command = this.commands.help;
        } else {
            args._.shift(); // remove command itself
            rawArgv.shift();
        }
        const {fn} = command;
        return fn(args, rawArgv);
    }
    resolvePlugins(inlinePlugins, useBuiltIn) {
        const idToPlugin = id => ({
            id: id.replace(/^.\//, 'built-in:'),
            apply: require(id)
        });

        let plugins;

        const builtInPlugins = [
            './commands/serve',
            // './commands/build',
            // config plugins are order sensitive
            './config/base',
            './config/css',
            './config/dev',
            './config/prod',
            './config/app'
        ].map(idToPlugin);

        if (inlinePlugins) {
            plugins = useBuiltIn !== false ? builtInPlugins.concat(inlinePlugins) : inlinePlugins;
        } else {
            const projectPlugins = Object.keys(this.pkg.devDependencies || {})
                .concat(Object.keys(this.pkg.dependencies || {}))
                .filter(isPlugin)
                .map(idToPlugin);
            plugins = builtInPlugins.concat(projectPlugins);
        }

        return plugins;
    }
    resolveChainableWebpackConfig() {
        const chainableConfig = new Config();
        // apply chains
        this.webpackChainFns.forEach(fn => fn(chainableConfig));
        return chainableConfig;
    }
    resolveWebpackConfig(chainableConfig = this.resolveChainableWebpackConfig()) {
        if (!this.initialized) {
            throw new Error('Service must call init() before calling resolveWebpackConfig().');
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
                    config = merge(config, res);
                }
            } else if (fn) {
                // merge literal values
                config = merge(config, fn);
            }
        });

        // #2206 If config is merged by merge-webpack, it discards the __ruleNames
        // information injected by webpack-chain. Restore the info so that
        // vue inspect works properly.
        if (config !== original) {
            cloneRuleNames(config.module && config.module.rules, original.module && original.module.rules);
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
