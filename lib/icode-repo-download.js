/**
 * @file 下载 icon repo
 */
const gitclone = require('git-clone');
const rm = require('rimraf').sync;

module.exports = (repo, dest, fn) => {
    repo = normalize(repo);
    const {url, checkout} = repo;

    gitclone(url, dest, {checkout, shallow: checkout === 'master'}, err => {
        if (!err) {
            rm(`${dest}/.git`);
            fn();
        }
        else {
            fn(err);
        }
    });
};
function normalize(repo) {
    // https://wangyongqing01@icode.baidu.com/baidu/ezcode/jssdk
    // ssh://wangyongqing01@icode.baidu.com:8235/baidu/ezcode/jssdk
    // ssh://git@icode.baidu.com:8235/baidu/ezcode/jssdk
    // 公司名/目录名/repo#分支
    // TODO:支持@baidu pnpm
    const regex = /^(?:(baidu)\/)?(?:([^\/]+)\/)?([^#]+)(?:#(.+))?$/;
    const match = regex.exec(repo);
    if (!match) {
        return {
            url: repo,
            checkout: 'master'
        };
    }

    const [m, baidu='baidu', dir='searchbox-fe', name, checkout='master'] = match;
    const url = `ssh://git@icode.baidu.com:8235/${baidu}/${dir}/${name}`;
    return {
        url,
        checkout
    };
}
