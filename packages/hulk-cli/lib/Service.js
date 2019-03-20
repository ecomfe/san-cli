/**
 * @file service, inspired by vue-cli3
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {resolve, isAbsolute} = require('path');
const fs = require('fs');
const chalk = require('chalk');
const defaultsDeep = require('lodash.defaultsdeep');
const Config = require('webpack-chain');
const merge = require('webpack-merge');

const {error} = require('@baidu/hulk-utils/logger'); // eslint-disable-line
const {getDebugLogger} = require('@baidu/hulk-utils/get-debug'); // eslint-disable-line
const defaults = require('./defaultConfig');
const PluginAPI = require('./PluginAPI');

const env = ['production', 'development'];
const debug = getDebugLogger('Service');

module.exports = class Service {
    constructor(context, {configFile, plugins, useBuiltInPlugin} = {}) {
        this.initialized = false;
        this.context = context || process.cwd();
        // webpack chain & merge array
        this.webpackChainFns = [];
        this.webpackRawConfigFns = [];
        this.configFile = configFile;
        this.plugins = this.resolvePlugins(plugins, useBuiltInPlugin);
    }
    resolvePlugins(inlinePlugins, useBuiltInPlugin = true) {
        const idToPlugin = id => ({
            id: id.replace(/^.\//, 'built-in:'),
            apply: require(id)
        });

        const builtInPlugins = [
            './configs/base',
            './configs/css',
            './configs/dev',
            './configs/prod',
            './configs/app'
        ].map(idToPlugin);

        let plugins;
        if (inlinePlugins && Array.isArray(inlinePlugins)) {
            inlinePlugins.map(p => {
                if (typeof p === 'string') {
                    // 处理引入
                    if (!isAbsolute(p)) {
                        p = resolve(this.context, p);
                    }
                    try {
                        let plugin = require(p);
                        if (plugin.default) {
                            // 重新赋值
                            plugin = plugin.default;
                        }
                        if (typeof plugin === 'object' && plugin.id && typeof plugin.apply === 'function') {
                            return plugin;
                        } else {
                            throw new Error('Plugin is valid : ' + p);
                        }
                    } catch (e) {
                        throw new Error('Require plugin is valid : ' + p);
                    }
                } else if (typeof p === 'object' && p.id && typeof p.apply === 'function') {
                    // 处理 object
                    return p;
                } else {
                    throw new Error('Plugin is valid : ' + p);
                }
            });
            plugins = useBuiltInPlugin !== false ? builtInPlugins.concat(inlinePlugins) : inlinePlugins;
        } else {
            plugins = builtInPlugins;
        }

        return plugins;
    }
    init(mode = 'development') {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.mode = env.includes(mode) ? mode : process.env.NODE_ENV === 'production' ? 'production' : 'development';

        let config = defaultsDeep(this.loadConfigFile(this.configFile), defaults);

        // 如果是 生产环境，优先使用 build
        const isProd = this.mode === 'production';
        if (isProd && config.build && typeof config.build === 'object') {
            config = defaultsDeep(config.build, config);
        }

        debug(this.config);
        // apply plugins.
        this.plugins.forEach(({id, apply}) => {
            apply(new PluginAPI(id, this), config);
        });
        if (config.chainWebpack) {
            this.webpackChainFns.push(config.chainWebpack);
        }
        if (config.configureWebpack) {
            this.webpackRawConfigFns.push(config.configureWebpack);
        }
        return config;
    }
    loadConfigFile(configFile = 'hulk.config.js') {
        let config = {};
        const configPath = resolve(this.context, configFile);
        if (configPath && fs.existsSync(configPath)) {
            try {
                delete require.cache[configPath];
                config = require(configPath);
                if (config.default) {
                    config = config.default;
                }
                if (!config || (typeof config !== 'object' && typeof config !== 'function')) {
                    error(`${chalk.bold(configPath)}: 格式必须是对象或者fn(mode).`);
                    config = null;
                }
                if (typeof config === 'function') {
                    config = config(this.mode);
                }
            } catch (e) {
                error(`Error loading ${chalk.bold(configPath)} `);
                throw e;
            }
        }

        // normalize some options
        ensureSlash(config, 'baseUrl');
        if (typeof config.baseUrl === 'string') {
            config.config = config.baseUrl.replace(/^\.\//, '');
        }
        removeSlash(config, 'outputDir');

        return config;
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
function ensureSlash(config, key) {
    let val = config[key];
    if (typeof val === 'string') {
        if (!/^https?:/.test(val)) {
            val = val.replace(/^([^/.])/, '/$1');
        }
        config[key] = val.replace(/([^/])$/, '$1/');
    }
}

function removeSlash(config, key) {
    if (typeof config[key] === 'string') {
        config[key] = config[key].replace(/\/$/g, '');
    }
}
