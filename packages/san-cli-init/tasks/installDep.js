/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 安装依赖
 * @author ksky521
 */

const fs = require('fs-extra');
const execa = require('execa');
const registries = require('../registries');
const path = require('path');
const prompt = require('../utils/prompt');
const {hasYarn} = require('san-cli-utils/env');

module.exports = (template, dest, options) => {
    return async (ctx, task) => {
        const hasPackage = fs.existsSync(path.join(dest, 'package.json'));
        let install = hasPackage && options.install;
        let askInstall = !install;
        if (ctx.metaData && typeof ctx.metaData === 'object') {
            // 这里使用 metaData 重写一下，根据 template 的 meta.json 来决定使用 yarn/npm，是否 install
            if (ctx.metaData.hasOwnProperty('useYarn')) {
                options.useYarn = !!ctx.metaData.useYarn;
            }
            if (hasPackage && ctx.metaData.hasOwnProperty('installDeps')) {
                askInstall = !!ctx.metaData.installDeps;
                install = askInstall !== false;
            }
        }
        // 有package.json但是命令中没加--install
        if (hasPackage && askInstall) {
            const name = 'install';
            task.info();
            // 询问是否需要安装
            const answers = await prompt([
                {
                    type: 'confirm',
                    name,
                    message: 'Would you like to install npm dependencies?'
                }
            ]);
            if (answers[name]) {
                install = true;
            }
        }

        if (install) {
            try {
                // 清理 log，交给 npm
                task.info('Installing dependencies...');
                await installDeps(dest, options);
                task.complete();
            }
            catch (e) {
                task.error(e);
            }
        }
        else {
            task.skip('Not install dependencies');
            task.complete();
        }
    };
};

function installDeps(dest, {verbose = false, registry, useYarn = true}) {
    let args = [];
    let command;
    // 优先使用yarn
    if (useYarn && hasYarn()) {
        registry = registry || registries.taobao;
        // args = ['--registry=' + registry];
        args = [];
        command = 'yarn';
    }
    // 使用npm
    else {
        registry = registry || registries.taobao;
        // args = ['install', '--loglevel', 'error', '--registry=' + registry];
        args = ['install', '--loglevel', 'error'];
        command = 'npm';
    }
    return execa(command, args, {
        cwd: dest,
        stdio: verbose ? ['inherit', 'inherit', 'inherit'] : ['ignore', 'ignore', 'inherit']
    });
}
