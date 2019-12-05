/**
 * @file 下载 github/icode repo
 */
const gitclone = require('git-clone');
const fse = require('fs-extra');
const {logger, error} = require('san-cli-utils/ttyLogger');
const debug = logger.withTag('download-repo').debug;
const {getGitUser} = require('san-cli-utils/env');

module.exports = (repo, dest, options) => {
    repo = normalize(repo, options);
    const {url, checkout = 'master'} = repo;

    const rm = fse.removeSync;
    // 先删除
    rm(dest);
    return new Promise((resolve, reject) => {
        debug(url, dest, checkout);
        gitclone(url, dest, {checkout, shallow: checkout === 'master'}, err => {
            if (!err) {
                rm(`${dest}/.git`);
                resolve({url, dest, checkout});
            } else {
                error(err);
                reject(err);
            }
        });
    });
};
function normalize(repo, opts) {
    // aliasmap
    // 这里的 templateAliasMap 是通过 sanrc → yargs argv 传入的
    if (opts.templateAliasMap && opts.templateAliasMap[repo]) {
        repo = opts.templateAliasMap[repo];
    }
    // https://wangyongqing01@icode.baidu.com/baidu/ezcode/jssdk
    // ssh://wangyongqing01@icode.baidu.com:8235/baidu/ezcode/jssdk
    // ssh://git@icode.baidu.com:8235/baidu/ezcode/jssdk
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
    const user = isBaidu ? name : opts.username !== '' ? opts.username : 'git';

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
                // https://wangyongqing01@icode.baidu.com/baidu/baiduappfeed/itemrep
                url = `https://${user}@icode.baidu.com/${baidu}/${product}/${repoName}`;
            } else {
                url = `ssh://${user}@icode.baidu.com:8235/${baidu}/${product}/${repoName}`;
            }
            break;
        case 'github':
        case 'gitlab':
        case 'bitbucket':
            if (useHttps) {
                // https://github.com/ksky521/san-webpack.git
                url = `https://${source}.com/${product}/${repoName}.git`;
            } else {
                // git@github.com:ksky521/san-webpack.git
                url = `git@${source}.com:${product}/${repoName}.git`;
            }
            break;
        case 'coding':
            if (useHttps) {
                url = `https://git.coding.net/${product}/${repoName}.git`;
            } else {
                url = `git@git.coding.net:${product}/${repoName}.git`;
            }
            break;
    }
    return {
        url,
        checkout
    };
}
