/**
 * @file check version
 */

const {name, version} = require('../../package');
const request = require('request');
const semver = require('semver');
const chalk = require('chalk');
const registry = 'http://registry.npm.baidu-int.com';
const cliName = name.split('/').pop();
// 获取最新版本
function getLatestVersion() {
    return new Promise((resolve, reject) => {
        request({
            url: `${registry}/${name}`,
            timeout: 1000
        }, (err, res, body) => {
            if (!err && res.statusCode === 200) {
                const latestVersion = JSON.parse(body)['dist-tags'].latest;
                resolve({current: version, latest: latestVersion});
            }
            else {
                resolve({current: version, latest: version});
            }
        });
    });
}
exports.checkVersion = async done => {
    const {current, latest} = await getLatestVersion();
    let title = chalk.bold.blue(`${cliName} v${current}`);

    if (semver.lt(current, latest)) {
        title += chalk.green(` 🌟️ Update available: ${latest}`);
    }

    console.log(title);
    done();
};
exports.getLatestVersion = getLatestVersion;
