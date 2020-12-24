/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 检查目录和离线包状态
 * @author ksky521
 */

const path = require('path');
const fs = require('fs-extra');
const {chalk} = require('san-cli-utils/ttyLogger');
const {isLocalPath, getLocalTplPath} = require('san-cli-utils/path');
const prompt = require('../utils/prompt');

module.exports = (template, dest, options) => {
    return async (ctx, task) => {
        task.info('Start checking target directory status');
        // 处理目标目录存在的情况，显示 loading 啊~
        if (fs.existsSync(dest)) {
            // 如果强制带--force，那就删了这个目录
            if (options.force) {
                task.info('--force delete target directory');
                fs.remove(dest);
                // 如果是当前目录下建
            }
            else if (options._inPlace) {
                task.info(); // 添加这一句下面才能显示 prompt
                // 来一个疑问句，问是否确定在当前目录创建？
                // eslint-disable-next-line
                const {ok} = await prompt([
                    {
                        name: 'ok',
                        type: 'confirm',
                        message: 'Are you sure to create a project in the current directory?'
                    }
                ]);
                // 如果不愿意，那么此流程停止
                if (!ok) {
                    return;
                }
            }
            else {
                task.info();
                // 取一个相对目录
                const shortDest = path.relative(process.cwd(), dest);
                // 处理对于已经存在的目录
                const {action} = await prompt([
                    {
                        name: 'action',
                        type: 'list',
                        // eslint-disable-next-line
                        message: `The directory ${chalk.cyan(
                            shortDest
                        )} already exists. Please select an operation：`,
                        choices: [
                            {name: 'overwrite', value: 'overwrite'},
                            {name: 'merge', value: 'merge'},
                            {name: 'cancel', value: false}
                        ]
                    }
                ]);
                // 选了取消
                if (!action) {
                    return task.error(`Cancel overwrite ${shortDest} directory`);
                    // 选了覆盖
                }
                else if (action === 'overwrite') {
                    task.info(`Overwrite selected, first delete ${shortDest}...`);
                    await fs.remove(dest);
                }
            }
        }

        task.info('Check the status of the offline template');
        const isOffline = options.offline;
        if (isOffline || isLocalPath(template)) {
            // 使用离线地址
            // 直接复制，不下载 icode 代码
            const templatePath = getLocalTplPath(template);
            if (fs.existsSync(templatePath)) {
                // 添加本地 template 路径
                ctx.localTemplatePath = templatePath;
            }
            else {
                // 直接使用本地的路径进行复制
                const localAbsolutePath = path.resolve(template);
                if (fs.existsSync(localAbsolutePath)) {
                    // 使用本地路径直接复制
                    ctx.localTemplatePath = localAbsolutePath;
                    return task.complete();
                }

                return task.error('Offline scaffolding template path does not exist');
            }
        }
        task.complete();
    };
};
