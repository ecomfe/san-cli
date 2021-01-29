/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file init command
 * @author ksky521
 */

const isTemplatePath = require('./utils/isTemplatePath');

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
    },
    'project-presets': {
        type: 'string',
        default: '',
        hidden: true,
        describe: 'The JSON string of project preset according to PROMPTS in meta.js within template'
    }
};

// 默认项目脚手架地址

const defaultTemplate = 'ksky521/san-project';

exports.handler = argv => {
    const {warn} = require('san-cli-utils/ttyLogger');

    let {template, appName} = argv;

    if (template && appName === undefined) {
        // 只有一个参数的情况
        // 如果是模板，则默认使用当前文件夹
        if (isTemplatePath(template)) {
            appName = './';
            const folderName = process
                .cwd()
                .split('/')
                .pop();
            warn(`Use ${folderName} as project name`);
        } else {
            // 如果不是模板，则认为是文件夹地址，并使用默认的模板
            appName = template;
            template = defaultTemplate;
            warn(`Use ${defaultTemplate} as scaffold template.`);
        }
    } else if (template === undefined) {
        // 两个参数都没有
        template = defaultTemplate;
        appName = './';
        warn(`Use ${defaultTemplate} as scaffold template.`);
    }

    const options = Object.assign(argv, {template, appName});
    require('./run')(template, appName, options);
};
