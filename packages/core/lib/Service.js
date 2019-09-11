/**
 * @file Service Class
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const fs = require('fs');
const {resolve, isAbsolute} = require('path');

const Config = require('webpack-chain');
const webpackMerge = require('webpack-merge');

const {chalk, error, warn} = require('@hulk/core/ttyLogger');

const BUILDIN_PLUGINS = ['../configs'];

module.exports = class Service {
    constructor(context, {plugins, useBuiltInPlugin = true} = {}) {
        this.context = context || process.cwd();
        this.initialized = false;
        // webpack chain & merge array
        this.webpackChainFns = [];
        this.webpackRawConfigFns = [];
        this.devServerConfigFns = [];

        // 相关的 Map
        this.commands = new Map();

        this.plugins = this.resolvePlugins(plugins, useBuiltInPlugin);
    }
    resolvePlugins(plugins, useBuiltInPlugin = true) {}
    init(mode) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.mode = mode;
        // load user config
        const userOptions = this.loadUserOptions();
        this.projectOptions = defaultsDeep(userOptions, defaults());


        // apply plugins.
        this.plugins.forEach(({id, apply}) => {
            if (this.pluginsToSkip.has(id)) return;
            apply(new PluginAPI(id, this), this.projectOptions);
        });

        // apply webpack configs from project config file
        if (this.projectOptions.chainWebpack) {
            this.webpackChainFns.push(this.projectOptions.chainWebpack);
        }
        if (this.projectOptions.configureWebpack) {
            this.webpackRawConfigFns.push(this.projectOptions.configureWebpack);
        }
    }
    run(argv) {}
};
