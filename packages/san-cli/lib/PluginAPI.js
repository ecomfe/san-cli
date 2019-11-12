// 1. 注册某个命令的 flag 激活
// 2. 获取 webpackchain api
// 3. 获取user config
// 4. 注册 hook 时机
// 5. 添加 log
const path = require('path');
const debug = require('../lib/debug');
const npmlog = require('npmlog');
module.exports = class PluginAPI {
    constructor(id, service) {
        this.id = id;
        this.service = service;
        this.log = npmlog;
    }
    isProd() {
        return this.service.mode === 'production';
    }
    debug(prefix) {
        return debug(prefix);
    }
    chainWebpack(fn) {
        this.service.webpackChainFns.push(fn);
    }
    configureWebpack(fn) {
        this.service.webpackRawConfigFns.push(fn);
    }
    resolve(p) {
        if (p) {
            return path.resolve(this.service.cwd, p);
        } else {
            return this.service.cwd;
        }
    }
};
