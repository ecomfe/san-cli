/**
 * @file check version
 */

const request = require('request');
// 获取最新版本
function getLatestVersion(name = '@baidu/hulk-cli', registry = 'http://registry.npm.baidu-int.com') {
    return new Promise(resolve => {
        request({
            url: `${registry}/${name}`,
            timeout: 1000
        }, (err, res, body) => {
            if (!err && res.statusCode === 200) {
                const latest = JSON.parse(body)['dist-tags'].latest;
                resolve({
                    latest
                });
            }
            else {
                resolve('0.0.0');
            }
        });
    });
}
exports.getLatestVersion = getLatestVersion;
