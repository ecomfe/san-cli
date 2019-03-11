/**
 * @file check version
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const spawn = require('child_process').spawn;
const path = require('path');
const format = require('util').format;

const r = require('import-lazy')(require);
const request = r('request');
const debug = r('./get-debug').getDebugLogger('get-lastest-version');

// 获取最新版本
function getLatestVersion(name = '@baidu/hulk-cli', registry = 'http://registry.npm.baidu-int.com') {
    return new Promise(resolve => {
        request(
            {
                url: `${registry}/${name}`,
                timeout: 3000
            },
            (err, res, body) => {
                if (!err && res.statusCode === 200) {
                    const latest = JSON.parse(body)['dist-tags'].latest;
                    debug(latest);
                    resolve(latest);
                } else {
                    debug()(err, `${registry}/${name}`);
                    resolve('0.0.0');
                }
            }
        );
    });
}
exports.getLatestVersion = getLatestVersion;
