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
const shortId = require('shortid');
const notifier = require('node-notifier');
const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const {getGitUser} = require('san-cli-utils/env');
const {tmpl} = require('san-cli-utils/utils');
const cwd = require('./cwd');
const events = require('../utils/events');
const folders = require('./folders');

const DEFAULT_TEMPLATE_PATH = '.san/templates/san-project';

const isDev = process.env.SAN_CLI_UI_DEV;
const SAN_COMMAND_NAME =  isDev ? 'yarn' : 'san';
const SAN_COMMAND_ARGS =  isDev ? ['dev:san'] : [];

const debug = getDebugLogger('ui:project');

const initTemplate = async (useCache = true) => {
    const args = [
        '--download-repo-only'
    ];

    const localTemplatePath = path.join(require('os').homedir(), DEFAULT_TEMPLATE_PATH);

    // 1. 判断本地目录是否存在，如果存在则不去github远程拉取
    if (useCache && fs.existsSync(localTemplatePath)) {
        debug('fetch template from local...');
        args.push('--offline');
    }
    else {
        debug('fetching template from github...');
    }

    const child = execa(SAN_COMMAND_NAME, SAN_COMMAND_ARGS.concat([
        'init',
        // 初始化模板，此时app-name参数不需要
        'APP_NAME_PLACEHOLDER',
        ...args
    ]), {
        cwd: cwd.get(),
        stdio: ['inherit', 'pipe', 'inherit']
    });

    child.stdout.on('data', buffer => {
        const text = buffer.toString().trim();
        debug(text);
    });

    await child;

    // 2. 获取项目脚手架的预设，传给前端
    const metaPrompts = require(`${localTemplatePath}/meta.js`).prompts;
    const prompts = Object.keys(metaPrompts).map(name => ({
        name,
        ...metaPrompts[name]
    }));

    // 3. 替换default字段中的占位符
    const templateData = {
        name: path.basename(process.cwd()),
        author: getGitUser().name
    };

    prompts.forEach(item => {
        if (typeof item.default === 'string') {
            item.default = tmpl(item.default, templateData);
        }
    });

    // 4. 返回prompt数据，由前端生成form表单
    return {
        prompts
    };
};

const create = async (params, context) => {
    const args = [
        `--project-presets='${JSON.stringify(params.presets)}'`,
        '--offline',
        '--install'
    ];

    debug(`
    ${SAN_COMMAND_NAME}
    ${SAN_COMMAND_ARGS.concat([
        'init',
        params.name,
        ...args
    ]).join(' ')}
    `);

    const child = execa(SAN_COMMAND_NAME, SAN_COMMAND_ARGS.concat([
        'init',
        params.name,
        ...args
    ]), {
        cwd: process.cwd(),
        stdio: ['inherit', 'pipe', 'inherit']
    });

    child.stdout.on('data', buffer => {
        const text = buffer.toString().trim();
        events.emit('log', {
            type: 'info',
            message: text
        });
        debug(text);
    });

    await child;

    notifier.notify({
        title: 'San Project Created',
        message: `Project ${cwd.get()} created`,
        icon: path.resolve(__dirname, '../../client/assets/done.png')
    });

    return {
        errno: 0
    };
};

const list = context => {
    // 得到项目列表，同时清理路径不存在的项目
    const projects = context.db.get('projects').value();
    const existedProjects = projects.filter(project => fs.existsSync(project.path));
    if (existedProjects.length !== projects.length) {
        console.log(`Auto cleaned ${projects.length - existedProjects.length} projects (folder not found).`);
        context.db.set('projects', existedProjects).write();
    }
    return existedProjects;
};

const importProject = async (params, context) => {
    if (!params.force && !fs.existsSync(path.join(params.path, 'node_modules'))) {
        throw new Error('NO_MODULES');
    }

    const project = {
        id: shortId.generate(),
        path: params.path,
        favorite: 0,
        type: folders.isSanProject(params.path) ? 'san' : 'unknown'
    };

    const packageData = folders.readPackage(project.path, context);
    project.name = packageData.name;
    context.db.get('projects').push(project).write();

    return {
        ...project
    };
};

const findOne = (id, context) => {
    return context.db.get('projects').find({id}).value();
};

const setFavorite = ({id, favorite}, context) => {
    context.db.get('projects').find({id}).assign({favorite}).write();
    return findOne(id, context);
};

module.exports = {
    initTemplate,
    create,
    list,
    findOne,
    setFavorite,
    importProject
};
