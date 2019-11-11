/**
 * @file init command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

exports.command = 'init';
exports.desc = 'Create an empty repo';
exports.builder = {
    useCache: {
        default: false
    },
    verbose: {
        default: false
    },
    install: {
        default: false
    },
    offline: {
        default: false
    },
    force: {
        default: false
    },
    user: {
        default: 'git'
    },
    registry: {
        default: ''
    }
};
exports.handler = argv => {
    const template = argv._[1];
    const appName = argv._[2];
    const TaskList = require('./TaskList');
    const checkStatus = require('./tasks/checkStatus');
    const download = require('./tasks/download');
    const generator = require('./tasks/generator');
    const installDep = require('./tasks/installDep');
    const path = require('path');
    const {error} = require('../../lib/ttyLogger');

    // template = alias(template);
    const inPlace = !appName || appName === '.';
    // inPlace：是否在当前目录
    argv._inPlace = inPlace;
    // dest：新建工程的目录
    const dest = path.resolve(appName || '.');
    // 记录一下开始新建工程时的起始时间
    const startTime = Date.now();
    const taskList = [
        {title: '🔍 检测目录和离线包状态...', task: checkStatus(template, dest, argv)},
        {title: '🚚 下载项目脚手架模板...', task: download(template, dest, argv)},
        {title: '🔨 生成项目目录结构...', task: generator(template, dest, argv)},
        {title: '🔗 安装项目依赖...', task: installDep(template, dest, argv)}
    ];

    // 离线脚手架目录处理
    // 1. 下载安装包 download
    // 2. 解包 unpack
    // 3. 安装 install
    // 4. 安装依赖 installDep
    // 5. 结束，显示问候语
    const tasks = new TaskList(taskList);
    tasks
        .run()
        .then(ctx => {
            // const {metaData: argv, tplData: data} = ctx;
            const duration = (((Date.now() - startTime) / 10) | 0) / 100;
            console.log('✨  Done in ' + duration + 's.');
        })
        .catch(e => {
            error(e);

            process.exit(1);
        });
};
