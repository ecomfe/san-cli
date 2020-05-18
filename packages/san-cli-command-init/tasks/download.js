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
const {getLocalTplPath} = require('san-cli-utils/path');
const downloadRepo = require('../utils/downloadRepo');

module.exports = (template, dest, options) => {
    return async (ctx, task) => {
        if (ctx.localTemplatePath) {
            // 使用本地路径
            const relativePath = path.relative(process.cwd(), ctx.localTemplatePath).replace(/^(\.+\/+)+/g, '');
            task.skip('Use local path `' + relativePath + '`');
            task.complete();
            return;
        }
        // 临时存放地址，存放在~/.san/templates 下面
        let tmp = getLocalTplPath(template);
        if (options.useCache && fs.existsSync(tmp)) {
            ctx.localTemplatePath = tmp;
            // 优先使用缓存
            task.skip('Discover local cache and use it');
            task.complete();
        }
        else {
            // 否则拉取远程仓库的模板
            task.info('Pulling template from the remote repository...');
            downloadRepo(template, tmp, options)
                .then(() => {
                    ctx.localTemplatePath = tmp;
                    task.complete();
                })
                .catch(errMessage => task.error(errMessage));
        }
    };
};
