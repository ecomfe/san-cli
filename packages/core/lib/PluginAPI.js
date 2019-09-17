// 1. 注册某个命令的 flag 激活
// 2. 获取 webpackchain api
// 3. 获取user config
// 4. 注册 hook 时机
// 5. 添加 log

const path = require('path');
module.exports = class PluginAPI {
    constructor(id, service) {
        this.id = id;
        this.service = service;
    }
    chainWebpack(fn) {
        this.service.webpackChainFns.push(fn);
    }
    configureWebpack(fn) {
        this.service.webpackRawConfigFns.push(fn);
    }
    resolve(p) {
        return path.resolve(this.service.cwd, p);
    }
};
