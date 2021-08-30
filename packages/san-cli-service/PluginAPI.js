/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file pluginAPI Class
 * inspired by https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/PluginAPI.js
 */

const path = require('path');
const {getScopeLogger} = require('san-cli-utils/ttyLogger');
const argsert = require('san-cli-utils/argsert');
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
        return process.env.NODE_ENV === 'production';
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
    getProjectOptions() {
        return this.service.projectOptions;
    }
    isLegacyBundle() {
        return parseInt(process.env.SAN_CLI_LEGACY_BUILD, 10) === 1;
    }
    resolve(p) {
        if (p) {
            argsert('<string>', [p], arguments.length);
            return path.resolve(this.service.cwd, p);
        }
        return this.service.cwd;
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
