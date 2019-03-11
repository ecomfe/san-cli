/**
 * @file 下载 icon repo
 */
const importLazy = require('import-lazy')(require);
const gitclone = importLazy('git-clone');
const fse = importLazy('fs-extra');

const debug = require('./get-debug').getDebugLogger('download-repo');

const {getGitUser} = require('./git-user');

exports.downloadRepo = (repo, dest, opts = {}, fn) => {
    repo = normalize(repo, opts);
    const {url, checkout} = repo;
    // const rm = fse.removeSync;
    // 先删除
    rm(dest);
    return new Promise((resolve, reject) => {
        gitclone(url, dest, {checkout, shallow: checkout === 'master'}, err => {
            if (!err) {
                rm(`${dest}/.git`);
                resolve();
            } else {
                debug(err, url, dest, checkout);
                reject(err);
            }
        });
    });
};
function normalize(repo, opts) {
    // https://wangyongqing01@icode.baidu.com/baidu/ezcode/jssdk
    // ssh://wangyongqing01@icode.baidu.com:8235/baidu/ezcode/jssdk
    // ssh://git@icode.baidu.com:8235/baidu/ezcode/jssdk
    // 公司名/目录名/repo#分支
    const regex = /^(?:(icode|github|gitlab|bitbucket|coding)\:)?(?:(baidu)\/)?(?:([^\/]+)\/)?([^#]+)(?:#(.+))?$/;
    const useHttps = opts.useHttps || false;
    const {name, isBaidu} = getGitUser();
    // 如果是 是百度，则强制使用百度账号
    const user = isBaidu ? name : opts.user || 'git';

    const match = regex.exec(repo);
    if (!match) {
        return {
            url: repo,
            checkout: 'master'
        };
    }

    const [m, source = 'icode', baidu = 'baidu', product = 'hulk', repoName, checkout = 'master'] = match;
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
                // https://github.com/vuejs-templates/pwa.git
                url = `https://${source}.com/${product}/${repoName}.git`;
            } else {
                // git@github.com:vuejs-templates/pwa.git
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
