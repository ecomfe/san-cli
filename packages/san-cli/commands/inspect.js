/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file inspect command
 * inspired by https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/commands/inspect.js
 */

exports.command = 'inspect [paths...]';
exports.description = 'Check the configuration of the built-in webpack';
exports.builder = {
    rule: {
        alias: 'ruleName',
        type: 'string',
        describe: 'Output configuration according to module rule name'
    },
    rules: {
        type: 'boolean',
        default: false,
        describe: 'List all module rules'
    },
    plugins: {
        type: 'boolean',
        default: false,
        describe: 'List all plugin names'
    },
    plugin: {
        alias: 'pluginName',
        type: 'string',
        describe: 'Output configuration based on the plugin name'
    }
};

exports.handler = argv => {
    const {toString} = require('webpack-chain');
    const service = require('../lib/service')('inspect', argv);

    service.run((api, project) => {
        const config = api.getWebpackConfig();
        let res;
        let hasUnnamedRule;

        if (argv.rule) {
            res = config.module.rules.find(r => r.__ruleNames[0] === argv.rule);
        } else if (argv.plugin) {
            res = config.plugins.find(p => p.__pluginName === argv.plugin);
        } else if (argv.rules) {
            res = config.module.rules.map(r => {
                const name = r.__ruleNames ? r.__ruleNames[0] : 'Nameless Rule (*)';

                hasUnnamedRule = hasUnnamedRule || !r.__ruleNames;

                return name;
            });
        } else if (argv.plugins) {
            res = config.plugins.map(p => p.__pluginName || p.constructor.name);
        } else if (argv.paths && argv.paths.length > 1) {
            res = {};
            argv.paths.forEach(path => {
                res[path] = get(config, path);
            });
        } else if (argv.paths && argv.paths.length === 1) {
            res = get(config, argv.paths[0]);
        } else {
            res = config;
        }

        const output = toString(res);
        console.log(output);
    });
};

function get(target, path) {
    const fields = path.split('.');
    let obj = target;
    const l = fields.length;
    for (let i = 0; i < l - 1; i++) {
        const key = fields[i];
        if (!obj[key]) {
            return undefined;
        }
        obj = obj[key];
    }
    return obj[fields[l - 1]];
}
