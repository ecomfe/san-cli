/**
 * @file 下载 icon repo
 */
const gitclone = require('git-clone');
const rm = require('rimraf').sync;
const debug = require('debug')('repo-download');

module.exports = (repo, dest, opts, fn) => {
    repo = normalize(repo, opts);
    const {url, checkout} = repo;

    gitclone(url, dest, {checkout, shallow: checkout === 'master'}, err => {
        if (!err) {
            rm(`${dest}/.git`);
            fn();
        }
        else {
            fn(err);
            debug(err, url, dest, checkout);
        }
    });
};
function normalize(repo, opts) {
    // https://wangyongqing01@icode.baidu.com/baidu/ezcode/jssdk
    // ssh://wangyongqing01@icode.baidu.com:8235/baidu/ezcode/jssdk
    // ssh://git@icode.baidu.com:8235/baidu/ezcode/jssdk
    // 公司名/目录名/repo#分支
    // TODO:支持@baidu pnpm
    const regex = /^(?:(icode|github)\:)?(?:(baidu)\/)?(?:([^\/]+)\/)?([^#]+)(?:#(.+))?$/;
    const useHttps = opts.https || false;
    const user = opts.user || 'git';

    const match = regex.exec(repo);
    if (!match) {
        return {
            url: repo,
            checkout: 'master'
        };
    }

    const [m, source='icode', baidu='baidu', dir='searchbox-fe', name, checkout='master'] = match;
    let url = repo;
    switch (source) {
        case 'icode':
            if (useHttps) {
                // https://wangyongqing01@icode.baidu.com/baidu/baiduappfeed/itemrep
                url = `https://${user}@icode.baidu.com/${baidu}/${dir}/${name}`;
            }
            else {
                url = `ssh://${user}@icode.baidu.com:8235/${baidu}/${dir}/${name}`;
            }
            break;
        case 'github':
            if (useHttps) {
                // https://github.com/vuejs-templates/pwa.git
                url = `https://github.com/${dir}/${name}.git`;
            }
            else {
                // git@github.com:vuejs-templates/pwa.git
                url = `${user}@github.com:${dir}/${name}.git`;
            }
            break;
    }
    return {
        url,
        checkout
    };
}
