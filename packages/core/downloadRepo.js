/**
 * @file 下载 icon repo
 */

const importLazy = require('import-lazy')(require);
const gitclone = importLazy('git-clone');
const fse = importLazy('fs-extra');
const debug = require('./ttyLogger').debug('download-repo');

exports.downloadRepo = (url, dest, checkout = 'master') => {
    const rm = fse.removeSync;
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
