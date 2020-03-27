/**
 * @file 安装依赖
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const rxjs = require('rxjs');
const fs = require('fs-extra');
const execa = require('execa');
const registries = require('../registries');
const path = require('path');
const prompt = require('../utils/prompt');
const {hasYarn} = require('@baidu/san-cli-utils/env');

module.exports = (template, dest, options) => {
    return (ctx, task) => {
        return new rxjs.Observable(async observer => {
            const hasPackage = fs.exists(path.join(dest, 'package.json'));
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
                observer.next();
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
                } else {
                    task.skip('Not install dependencies');
                    observer.complete();
                    return;
                }
            }

            if (install) {
                try {
                    // 清理 log，交给 npm
                    observer.next('Installing dependencies...');
                    await installDeps(dest, options);
                    observer.complete();
                } catch (e) {
                    observer.error(e);
                }
            }
        });
    };
};

function installDeps(dest, {verbose = false, registry, useYarn = true}) {
    let args = [];
    let command;
    // 优先使用yarn
    if (useYarn && hasYarn()) {
        registry = registry || registries.yarn;
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
        stdio: verbose ? ['inherit', 'inherit', 'inherit'] : ['ignore', 'ignore', 'ignore']
    });
}
