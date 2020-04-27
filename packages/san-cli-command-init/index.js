/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file init command
 * @author ksky521
 */

exports.command = 'init [template] [app-name]';
exports.description = 'Create an empty repo';
exports.builder = {
    'no-cache': {
        default: true,
        type: 'boolean',
        describe: 'Use local cache'
    },
    'no-yarn': {
        type: 'boolean',
        default: false,
        describe: 'Use yarn, if it exists.'
    },
    install: {
        type: 'boolean',
        default: false,
        describe: 'Install npm packages after initialization'
    },
    offline: {
        type: 'boolean',
        default: false,
        describe: 'Prefer to use local offline packages'
    },
    force: {
        type: 'boolean',
        default: false,
        describe: 'Forced coverage'
    },
    username: {
        type: 'string',
        alias: 'u',
        default: '',
        describe: 'Specify the username used by git clone command'
    },
    registry: {
        type: 'string',
        alias: 'r',
        default: '',
        describe: 'Specify npm package download registry'
    }
};

// 默认项目脚手架地址

const defaultTemplate = 'ksky521/san-project';
exports.handler = cliApi => {
    const {warn} = require('san-cli-utils/ttyLogger');

    let {template, appName} = cliApi;
    let {templateAlias: templateAliasMap} = cliApi.getPresets() || {};

    if (appName === undefined && template) {
        // 只有一个参数，这个默认是使用当前文件夹，把 appName 当成是脚手架地址
        appName = template;
        template = defaultTemplate;
        warn(`Use ${defaultTemplate} as scaffold template.`);
    }
    else if (template === undefined) {
        // 两个参数都没有
        template = defaultTemplate;
        appName = './';
        warn(`Use ${defaultTemplate} as scaffold template.`);
    }

    const options = Object.assign(cliApi, {templateAliasMap, template, appName});
    require('./run')(template, appName, options);
};
