/**
 * @file Plugin API, inspired by vue-cli3
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const PRODUCTION_MODE = require('../constants').PRODUCTION_MODE;
module.exports = class Plugin {
    constructor(id, service) {
        this.id = id;
        this.service = service;
    }
    getMode() {
        return this.service.mode;
    }

    /**
     * 获取当前工作目录
     * @return {string} 返回工作目录
     */
    getCwd() {
        return this.service.context;
    }

    /**
     * 是不是 production mode
     * @return {boolean} true|false
     */
    isProd() {
        return this.service.mode === PRODUCTION_MODE;
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
};
