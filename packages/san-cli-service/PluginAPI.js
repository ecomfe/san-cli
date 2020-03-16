/**
 * @file pluginAPI Class
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const {getScopeLogger} = require('@baidu/san-cli-utils/ttyLogger');
const argsert = require('@baidu/san-cli-utils/argsert');
module.exports = class PluginAPI {
    constructor(id, service) {
        argsert('<string> <object>', [id, service], arguments.length);
        this.id = id;
        this.service = service;
        // 添加个 scope
        const l = getScopeLogger(id || 'unknown-plugin');
        this.log = l;
        this.logger = l;
    }
    getServiceInstance() {
        return this.service;
    }
    isProd() {
        return this.service.mode === 'production';
    }
    getCwd() {
        return this.service.cwd;
    }
    getPkg() {
        return this.service.pkg;
    }
    getProjectOption() {
        return this.service.projectOptions;
    }
    resolve(p) {
        if (p) {
            argsert('<string>', [p], arguments.length);
            return path.resolve(this.service.cwd, p);
        } else {
            return this.service.cwd;
        }
    }
    chainWebpack(fn) {
        argsert('<function>', [fn], arguments.length);

        this.service.webpackChainFns.push(fn);
    }
    configWebpack(fn) {
        argsert('<function>', [fn], arguments.length);
        this.service.webpackRawConfigFns.push(fn);
    }
    middleware(middlewareFactory) {
        argsert('<function>', [middlewareFactory], arguments.length);
        this.service.devServerMiddlewares.push(middlewareFactory);
    }
};
