/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 下载 github/icode repo
 */

const gitclone = require('git-clone');
const fse = require('fs-extra');
const {getDebugLogger} = require('./ttyLogger');
const {getGitUser} = require('./env');
const {chalk} = require('./ttyLogger');

const debug = getDebugLogger('init:download-repo');

module.exports = (repo, dest, options) => {
    repo = normalize(repo, options);
    const {url, checkout = 'master', timeout = 60e3} = repo;
    const {template, appName} = options;
    const rm = fse.removeSync;
    // 先删除
    rm(dest);
    return new Promise((resolve, reject) => {
        debug('url: %s, dest: %s, branch: %s', url, dest, checkout);
        let tid;
        if (timeout && timeout > 10e3) {
            tid = setTimeout(() => {
                clearTimeout(tid);
                reject(
                    getErrorMessage('Download timeout, please check the network', {
                        repo,
                        url,
                        dest,
                        checkout,
                        template,
                        appName
                    })
                );
            }, timeout);
        }
        gitclone(url, dest, {checkout, shallow: checkout === 'master'}, err => {
            tid && clearTimeout(tid);

            if (!err) {
                rm(`${dest}/.git`);
                resolve({url, dest, checkout});
            }
            else {
                reject(
                    getErrorMessage(err.message, {
                        repo,
                        url,
                        dest,
                        checkout,
                        template,
                        appName
                    })
                );
            }
        });
    });
};
function getErrorMessage(reason, gitInfo) {
    // 说明是ssh方式
    const tRegex = /^((?:ssh:\/\/|git@).+?)(?:#(.+))?$/;
    let {url, appName} = gitInfo;
    const cmd = 'init';
    const info = `Fail to pull \`${url}\`${
        tRegex.test(url) ? ' with SSH' : ''
    }, please check the path and code permissions are correct.

Fail message: ${chalk.cyan(reason)}.

san init <template> <app-name>, for example:
    san ${cmd} ${chalk.cyan('yourname/template')} ${appName}
    san ${cmd} ${chalk.cyan('https://github.com/yourname/template.git')} ${appName}
    san ${cmd} ${chalk.cyan('github:yourname/template')} ${appName}
    san ${cmd} ${chalk.cyan('icode:baidu/path/template')} ${appName}
    san ${cmd} ${chalk.cyan('coding:yourname/template')} ${appName}
    san ${cmd} ${chalk.cyan('template#branch1')} ${appName}

Default template is ${chalk.cyan('ksky521/san-project')}, Use ${chalk.cyan('san init -h')} for more information.`;

    return info;
    // if (/failed with status 128/.test(reason)) {
    //     return info;
    // }
}
function normalize(repo, opts) {
    // aliasmap
    // 这里的 templateAliasMap 是通过 sanrc → yargs argv 传入的
    if (opts.templateAliasMap && opts.templateAliasMap[repo]) {
        repo = opts.templateAliasMap[repo];
    }
    // https://username@icode.baidu.com/baidu/foo/bar
    // ssh://username@icode.baidu.com:8235/baidu/foo/bar
    // ssh://git@icode.baidu.com:8235/baidu/foo/bar
    // 如果是完整地址，直接返回，无需标准化
    const tRegex = /^((?:ssh:\/\/|https:\/\/|git@).+?)(?:#(.+))?$/;
    if (tRegex.test(repo)) {
        const match = tRegex.exec(repo);
        return {
            url: match[1],
            checkout: match[2] || 'master'
        };
    }
    // 公司名/目录名/repo#分支
    const regex = /^(?:(icode|github|gitlab|bitbucket|coding):)?(?:(baidu)\/)?(?:([^/]+)\/)?([^#]+)(?:#(.+))?$/;
    const useHttps = opts.useHttps || false;
    const {name, isBaidu} = getGitUser();
    // 如果是 是百度，则强制使用百度账号
    const user = isBaidu ? name : opts.username !== '' && opts.username ? opts.username : 'git';

    const match = regex.exec(repo);
    if (!match) {
        return {
            url: repo,
            checkout: 'master'
        };
    }
    // TODO 这里要不要创建个 san-projects/san-templates 的用户放一些标准的项目脚手架？没有之前，product 默认写 ksky521吧~
    const [m, source = 'github', baidu = 'baidu', product = 'ksky521', repoName, checkout = 'master'] = match;
    let url = repo;
    switch (source) {
        case 'icode':
            if (useHttps) {
                // https://username@icode.baidu.com/baidu/foo/bar
                url = `https://${user}@icode.baidu.com/${baidu}/${product}/${repoName}`;
            }
            else {
                url = `ssh://${user}@icode.baidu.com:8235/${baidu}/${product}/${repoName}`;
            }
            break;
        case 'github':
        case 'gitlab':
        case 'bitbucket':
            if (useHttps) {
                // https://github.com/ksky521/san-webpack.git
                url = `https://${source}.com/${product}/${repoName}.git`;
            }
            else {
                // git@github.com:ksky521/san-webpack.git
                url = `git@${source}.com:${product}/${repoName}.git`;
            }
            break;
        case 'coding':
            if (useHttps) {
                url = `https://git.coding.net/${product}/${repoName}.git`;
            }
            else {
                url = `git@git.coding.net:${product}/${repoName}.git`;
            }
            break;
    }
    return {
        url,
        checkout
    };
}
