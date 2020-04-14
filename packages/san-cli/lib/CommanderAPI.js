/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file command中的api
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {logger} = require('@baidu/san-cli-utils/ttyLogger');

// 用于 build 和 serve 的通用逻辑处理
module.exports = class CommanderApi {
    constructor(name, commandInstance) {
        this._name = name;
        this._command = commandInstance;
        this._cli = commandInstance.cli;
        this._logger = logger;
        this._presets = commandInstance.presets || {};
    }
    getCwd() {
        return this._command.cwd;
    }
    getPresets(name) {
        if (typeof name === 'string') {
            return this._presets[name];
        } else if (Array.isArray(name)) {
            const rs = {};
            name.forEach(n => {
                rs[n] = this._presets[n];
            });
        }
        return this._presets;
    }
    getParsedArgv() {
        return this._command.parsedArgv;
    }
    help() {
        this._command.help();
        return this;
    }
    getCliInstance() {
        return this._cli;
    }
    getUsageInstance() {
        return this._cli.getUsageInstance();
    }
    getCommands() {
        return this._command._commands;
    }
};
