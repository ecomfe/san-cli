/**
 * @file 下载 github/icode repo
 */

const gitclone = require('git-clone');
const fse = require('fs-extra');
const debug = require('debug')('init:download-repo');

module.exports = (url, dest, checkout = 'master') => {
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
