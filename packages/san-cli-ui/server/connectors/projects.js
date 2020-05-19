/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 项目相关的api
 * @author jinzhan
 */

const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const debug = getDebugLogger('ui:create');
const {getGitUser} = require('san-cli-utils/env');
const {tmpl} = require('san-cli-utils/utils');

const TEMPLATE_PATH = '.san/templates/san-project';

const initTemplate = async (useCache = true) => {
    const args = [
        '--download-repo-only'
    ];

    const localTemplatePath = path.join(require('os').homedir(), TEMPLATE_PATH);

    // 1. 判断本地目录是否存在，如果存在则不去github远程拉取
    if (useCache) {
        if (fs.existsSync(localTemplatePath)) {
            args.push('--offline');
        }
    }

    // TODO: 正式版改成san
    const child = execa('yarn', [
        'dev:san',
        'init',
        'JUST-A-PLACEHOLDER',
        ...args
    ], {
        cwd: process.cwd(),
        stdio: ['inherit', 'pipe', 'inherit']
    });

    const onData = buffer => {
        const text = buffer.toString().trim();
        debug(text);
    };

    child.stdout.on('data', onData);

    await child;

    // 2. 获取项目脚手架的预设，传给前端
    const metaPrompts = require(`${localTemplatePath}/meta.js`).prompts;
    const prompts = Object.keys(metaPrompts).map(name => ({
        name,
        ...metaPrompts[name]
    }));

    // 3. 替换占位符，通常是default字段
    const templateData = {
        name: path.basename(process.cwd()),
        author: getGitUser().name
    };

    prompts.forEach(item => {
        if (typeof item.default === 'string') {
            item.default = tmpl(item.default, templateData);
        }
    });

    return {
        prompts
    };
};

const initCreator = async (name, presets) => {
    console.log('initCreator:', {name, presets});
    const args = [
        '--download-repo-only',
        '--offline'
    ];

    // TODO: 正式版改成san
    const child = execa('yarn', [
        'dev:san',
        'init',
        ...args
    ], {
        cwd: process.cwd(),
        stdio: ['inherit', 'pipe', 'inherit']
    });

    const onData = buffer => {
        const text = buffer.toString().trim();
        debug(text);
    };

    child.stdout.on('data', onData);

    await child;

    return {
        success: true
    };
};

module.exports = {
    initTemplate,
    initCreator
};
