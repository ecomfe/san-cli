/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file init command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const path = require('path');
const consolidate = require('consolidate');
const TaskList = require('./TaskList');
const checkStatus = require('./tasks/checkStatus');
const download = require('./tasks/download');
const generator = require('./tasks/generator');
const installDep = require('./tasks/installDep');
const Handlebars = require('./handlerbars');

const {error, chalk, success, fatal, boxen} = require('@baidu/san-cli-utils/ttyLogger');

module.exports = (template, appName, options = {}) => {
    // template = alias(template);
    const inPlace = !appName || appName === '.';
    // inPlace：是否在当前目录
    options._inPlace = inPlace;
    // dest：新建工程的目录
    const dest = path.resolve(appName || '.');
    // 记录一下开始新建工程时的起始时间
    const startTime = Date.now();
    const taskList = [
        {title: '🔍 Checking directory and offline package status...', task: checkStatus(template, dest, options)},
        {title: '🚚 Downloading project scaffolding template...', task: download(template, dest, options)},
        {title: '🔨 Generating directory structure...', task: generator(template, dest, options)},
        {title: '🔗 Installing dependencies...', task: installDep(template, dest, options)}
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
        .then(({metaData: opts, tplData: data}) => {
            // const {metaData: argv, tplData: data} = ctx;
            const duration = (((Date.now() - startTime) / 10) | 0) / 100;
            console.log('✨  Done in ' + duration + 's.');
            // 有些 meta 的信息之类会有问题，所以加个强制退出
            if (typeof opts.complete === 'function') {
                // 传入参数
                opts.complete(data, {
                    chalk,
                    logger: {
                        boxen,
                        error,
                        fatal,
                        success
                    },
                    files: []
                });
            } else {
                logMessage(opts.completeMessage, data);
            }
            process.exit(0);
        })
        .catch(e => {
            error(e);

            process.exit(1);
        });
};

function logMessage(message, data) {
    if (Handlebars.isHandlebarTPL(message)) {
        consolidate.handlebars
            .render(message, data)
            .then(res => {
                // 显示
                console.log(res);
            })
            .catch(error);
    } else if (message) {
        console.log(message);
    }
}
