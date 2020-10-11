/**
 * @file 项目相关的API
 * @author jinzhan
 */

const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const shortId = require('shortid');
const {getDebugLogger, log, error} = require('san-cli-utils/ttyLogger');
const {getGitUser} = require('san-cli-utils/env');
const {tmpl} = require('san-cli-utils/utils');
const downloadRepo = require('san-cli-utils/downloadRepo');
const {getLocalTplPath} = require('san-cli-utils/path');
const channels = require('../utils/channels');
const notify = require('../utils/notify');
const cwd = require('./cwd');
const events = require('../utils/events');
const {isSanProject, readPackage} = require('../utils/fileHelper');

const SAN_CLI_UI_DEV = process.env.SAN_CLI_UI_DEV === 'true';

// 用于本地开发调试
const SAN_COMMAND_NAME = SAN_CLI_UI_DEV ? 'yarn' : 'san';
const SAN_COMMAND_ARGS = SAN_CLI_UI_DEV ? ['dev:san'] : [];

// 默认的repositories
const DEFAULT_TEMPLATES = [{
    label: 'github:san-project-base',
    value: 'https://github.com/ksky521/san-project'
}];

const debug = getDebugLogger('ui:project');

class Projects {
    /**
     * 获取san的脚手架模板
     *
     * @return {Array<Object>}
     */
    async getTemplateList() {
        const child = await execa('san', ['remote', 'list']);
        // 来自于san remote list的repositories
        let remoteList = child.stdout.split('\n').slice(1);

        /**
         * 如果标准输出是：List is empty，则代表remote list为空
         * @see: san-cli/commands/remote/cmds/list.js
         */
        if (remoteList[0] === 'List is empty.') {
            remoteList = [];
        }

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

        // 添加默认的库
        const templates = remoteList.concat(DEFAULT_TEMPLATES);

        debug(`templates: ${templates.join(' \/ ')}`);

        return templates;
    }

    async initTemplate({template, useCache}) {
        // 临时存放地址，存放在~/.san/templates下面
        let tmp = getLocalTplPath(template);

        // 1. 优先使用缓存
        if (fs.existsSync(tmp)) {
            debug(`🥰 Using local template from ${tmp}`);
        }
        else {
            debug(`🥰 Downloading repository from ${template}`);
            await downloadRepo(template, tmp, {
                template,
                appName: 'APP_NAME_PLACEHOLDER'
            }).catch(errMessage => error(errMessage));
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
    }

    // 创建san项目
    async create(params, context) {
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

        notify({
            title: 'San Project Created',
            message: `Project ${cwd.get()} created`
        });

        return {
            errno: 0
        };
    }

    list(context) {
        // 得到项目列表，同时清理路径不存在的项目
        const projects = context.db.get('projects').value();
        const existedProjects = projects.filter(project => fs.existsSync(project.path));
        if (existedProjects.length !== projects.length) {
            log(`Auto cleaned ${projects.length - existedProjects.length} projects (folder not found).`);
            context.db.set('projects', existedProjects).write();
        }
        return existedProjects;
    }

    async importProject(params, context) {
        if (!params.force && !fs.existsSync(path.join(params.path, 'node_modules'))) {
            throw new Error('NO_MODULES');
        }
        if (this.findByPath(params.path, context)) {
            throw new Error('PROJECT_HAS_BEEN_IMPORTED');
        }
        const project = {
            id: shortId.generate(),
            path: params.path,
            favorite: 0,
            type: isSanProject(params.path) ? 'san' : 'unknown'
        };

        const packageData = readPackage(project.path, context);
        project.name = packageData.name || params.path.split('/').pop();
        context.db.get('projects').push(project).write();

        return {
            ...project
        };
    }

    findOne(id, context) {
        return context.db.get('projects').find({
            id
        }).value();
    }

    getCurrent(context) {
        let id = context.db.get('config.lastOpenProject').value();
        let currentProject = this.findOne(id, context);
        if (currentProject && !fs.existsSync(currentProject.path)) {
            log('Project folder not found', currentProject.id, currentProject.path);
            return null;
        }
        return currentProject;
    }

    open({id}, context) {
        const project = this.findOne(id, context);

        if (!project) {
            log('Project not found', id);
            return null;
        }

        if (!fs.existsSync(project.path)) {
            log('Project folder not found', id, project.path);
            return null;
        }

        // 存放到最近打开的项目中
        context.db.set('config.lastOpenProject', id).write();

        cwd.set(project.path, context);

        // 更新打开时间
        context.db.get('projects').find({
            id
        }).assign({
            openDate: Date.now()
        }).write();

        log('Project open', id, project.path);

        return project;
    }

    setFavorite({id, favorite}, context) {
        context.db.get('projects').find({
            id
        }).assign({
            favorite
        }).write();
        return this.findOne(id, context);
    }

    rename({id, name}, context) {
        context.db.get('projects').find({
            id
        }).assign({
            name
        }).write();
        return this.findOne(id, context);
    }

    remove({id}, context) {
        if (context.db.get('config.lastOpenProject').value() === id) {
            context.db.set('config.lastOpenProject', undefined).write();
        }
        context.db.get('projects').remove({
            id
        }).write();
        return true;
    }

    findByPath(file, context) {
        return context.db.get('projects').find({
            path: file
        }).value();
    }

    resetCwd(context) {
        let id = context.db.get('config.lastOpenProject').value();
        let currentProject = this.findOne(id, context);
        if (currentProject) {
            cwd.set(currentProject.path, context);
        }
    }

    getType(project, context) {
        if (typeof project === 'string') {
            project = this.findByPath(project, context);
        }
        if (!project) {
            return 'unknown';
        }
        return !project.type ? 'san' : project.type;
    }

    getLast(context) {
        let id = context.db.get('config.lastOpenProject').value();
        return this.findOne(id, context);
    }

    addRoute(route, context) {
        context.pubsub.publish(channels.ROUTE_REQUESTED, {
            routeRequested: route
        });
    }
};

module.exports = new Projects();
