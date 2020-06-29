/**
 * @file 项目相关的api
 * @author jinzhan
 */

const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const shortId = require('shortid');
const notifier = require('node-notifier');
const launch = require('launch-editor');
const {getDebugLogger, log, info} = require('san-cli-utils/ttyLogger');
const {getGitUser} = require('san-cli-utils/env');
const {tmpl} = require('san-cli-utils/utils');
const downloadRepo = require('san-cli-utils/downloadRepo');
const {getLocalTplPath} = require('san-cli-utils/path');
const cwd = require('./cwd');
const events = require('../utils/events');
const folders = require('./folders');

const SAN_CLI_UI_DEV = process.env.SAN_CLI_UI_DEV === 'true';

// 用于本地开发调试
const SAN_COMMAND_NAME =  SAN_CLI_UI_DEV ? 'yarn' : 'san';
const SAN_COMMAND_ARGS =  SAN_CLI_UI_DEV ? ['dev:san'] : [];

const debug = getDebugLogger('ui:project');

const getTemplateList = async () => {
    const child = await execa('san', ['remote', 'list']);
    // 1. 默认的repositories
    const defaultTemplates = [
        {
            label: 'github:san-project-base',
            value: 'https://github.com/ksky521/san-project'
        }
    ];

    // 2. 来自于san remote list的repositories
    let remoteList = child.stdout.split('\n').slice(1);
    if (remoteList.length) {
        remoteList = remoteList.map(val => {
            const ri = val.split(/\s+/);
            const value = ri.pop();
            const label = ri.join(' ');
            return {
                label,
                value
            };
        });
    }

    // 3. 添加默认的库
    const templates = remoteList.concat(defaultTemplates);

    debug(`templates: ${templates.join(' \/ ')}`);

    return templates;
};

const initTemplate = async ({template, useCache}) => {
    // 临时存放地址，存放在~/.san/templates下面
    let tmp = getLocalTplPath(template);

    // 优先使用缓存
    if (fs.existsSync(tmp)) {
        debug(`🥰 Using local template from ${tmp}`);
    }
    else {
        debug(`🥰 Downloading repository from ${template}`);
        await downloadRepo(template, tmp, {
            template,
            appName: 'APP_NAME_PLACEHOLDER'
        }).catch(errMessage => console.log(errMessage));
    }

    // 2. 获取项目脚手架的预设，传给前端
    const metaPrompts = require(`${tmp}/meta.js`).prompts;
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

// 创建san项目
const create = async (params, context) => {
    const args = [
        `--project-presets='${JSON.stringify(params.presets)}'`,
        '--offline',
        '--install'
    ];

    debug(`${JSON.stringify(params)}`);

    const cmdArgs = SAN_COMMAND_ARGS.concat([
        'init',
        params.template,
        params.name,
        ...args
    ]);

    debug(`${SAN_COMMAND_NAME} ${cmdArgs.join(' ')}`);

    const child = execa(SAN_COMMAND_NAME, cmdArgs, {
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
        log(`Auto cleaned ${projects.length - existedProjects.length} projects (folder not found).`);
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


const getCurrent = context => {
    let id = context.db.get('config.currentOpenProject').value();
    let currentProject = findOne(id, context);
    if (currentProject && !fs.existsSync(currentProject.path)) {
        log('Project folder not found', currentProject.id, currentProject.path);
        return null;
    }
    return currentProject;
};

const open = ({id}, context) => {
    const project = findOne(id, context);

    if (!project) {
        log('Project not found', id);
        return null;
    }
    if (!fs.existsSync(project.path)) {
        log('Project folder not found', id, project.path);
        return null;
    }
    // save current open project id
    context.db.set('config.currentOpenProject', id).write();
    // change path
    cwd.set(project.path, context);

    // update project Date
    context.db.get('projects').find({id}).assign({
        openDate: Date.now()
    }).write();

    log('Project open', id, project.path);

    return project;
};

const setFavorite = ({id, favorite}, context) => {
    context.db.get('projects').find({id}).assign({favorite}).write();
    return findOne(id, context);
};

const projectOpenInEditor = async (args, context) => {
    const {line, column} = args;
    let query = path.resolve(cwd.get(), args.path);
    if (line) {
        query += `:${line}`;
        if (column) {
            query += `:${column}`;
        }
    }
    info(`Opening file '${query}' in code editor...`);
    launch(query, 'code', (fileName, errorMsg) => {
        console.error(`Unable to open '${fileName}': ${errorMsg}`);
    });
    return true;
};

const rename = ({id, name}, context) => {
    context.db.get('projects').find({id}).assign({name}).write();
    return findOne(id, context);
};

const remove = ({id}, context) => {
    if (context.db.get('config.currentOpenProject').value() === id) {
        context.db.set('config.currentOpenProject', undefined).write();
    }
    if (context.db.get('config.lastOpenProject').value() === id) {
        context.db.set('config.lastOpenProject', undefined).write();
    }
    context.db.get('projects').remove({id}).write();
    return true;
};
const findByPath = (file, context) => {
    return context.db.get('projects').find({path: file}).value();
};
const resetCwd = context => {
    let id = context.db.get('config.currentOpenProject').value();
    let currentProject = findOne(id, context);
    if (currentProject) {
        cwd.set(currentProject.path, context);
    }
};

const getType = (project, context) => {
    if (typeof project === 'string') {
        project = findByPath(project, context);
    }
    if (!project) {
        return 'unknown';
    }
    return !project.type ? 'san' : project.type;
};
const getLast = context => {
    let id = context.db.get('config.lastOpenProject').value();
    return findOne(id, context);
};
module.exports = {
    getTemplateList,
    initTemplate,
    create,
    list,
    open,
    findOne,
    getCurrent,
    setFavorite,
    importProject,
    projectOpenInEditor,
    rename,
    remove,
    resetCwd,
    findByPath,
    getType,
    getLast
};
