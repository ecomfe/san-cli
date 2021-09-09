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
        describe: 'List all webpack plugin names'
    },
    plugin: {
        alias: 'pluginName',
        type: 'string',
        describe: 'Output configuration based on the plugin name'
    },
    'service-plugins': {
        alias: 'sp',
        type: 'boolean',
        default: false,
        describe: 'List all san cli plugin names'
    },
    config: {
        alias: 'config-file',
        type: 'string',
        hidden: true,
        describe: 'Project config file'
    }
};

exports.handler = argv => {
    const Service = require('san-cli-service');
    const service = new Service(process.cwd(), {watch: argv.watch, useDashboard: argv.dashboard});
    const run = require('./run');
    service.run('inspect', argv).then(run.bind(run, argv));
};
