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
            // 有package.json但是命令中没加--install
            if (hasPackage && !install) {
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
                    await installDeps(dest, options.verbose, options.registry);
                    observer.complete();
                } catch (e) {
                    observer.error(e);
                }
            }
        });
    };
};

function installDeps(dest, verbose = false, registry) {
    let args = [];
    let command;
    // 优先使用yarn
    if (hasYarn()) {
        registry = registry || registries.yarn;
        args = ['--registry=' + registry];
        command = 'yarn';
    }
    // 使用npm
    else {
        registry = registry || registries.taobao;
        args = ['install', '--loglevel', 'error', '--registry=' + registry];
        command = 'npm';
    }
    return execa(command, args, {
        cwd: dest,
        stdio: verbose ? ['inherit', 'inherit', 'inherit'] : ['ignore', 'ignore', 'ignore']
    });
}
