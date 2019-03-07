/**
 * @file pluginAPI from vue cli
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');

class PluginAPI {
    constructor(id, service) {
        this.id = id;
        this.service = service;
    }

    /**
     * 获取当前工作目录
     * @return {string} 返回工作目录
     */
    getCwd() {
        return this.service.context;
    }

    /**
     * Resolve path for a project.
     *
     * @param {string} p - Relative path from project root
     * @return {string} The resolved absolute path.
     */
    resolve(p) {
        return path.resolve(this.service.context, p);
    }

    registerCommand(name, opts, fn) {
        if (typeof opts === 'function') {
            fn = opts;
            opts = null;
        }
        this.service.commands[name] = {fn, opts: opts || {}};
    }

    chainWebpack(fn) {
        this.service.webpackChainFns.push(fn);
    }

    configureWebpack(fn) {
        this.service.webpackRawConfigFns.push(fn);
    }

    configureDevServer(fn) {
        this.service.devServerConfigFns.push(fn);
    }

    resolveWebpackConfig(chainableConfig) {
        return this.service.resolveWebpackConfig(chainableConfig);
    }

    /**
     * Resolve an intermediate chainable webpack config instance, which can be
     * further tweaked before generating the final raw webpack config.
     * You can call this multiple times to generate different branches of the
     * base webpack config.
     * See https://github.com/mozilla-neutrino/webpack-chain
     *
     * @return {ChainableWebpackConfig}
     */
    resolveChainableWebpackConfig() {
        return this.service.resolveChainableWebpackConfig();
    }
}

module.exports = PluginAPI;
