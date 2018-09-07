/**
 * @file 自己升级
 */

const {
    log,
    logWithSpinner,
    stopSpinner,
    getLatestVersion,
    updateSpinner,
    success,
    failSpinner
} = require('../lib/utils');
const semver = require('semver');
const chalk = require('chalk');
const execa = require('execa');
const registries = require('../lib/registries');
const {name} = require('../package');

module.exports = async(cwd, verbose) => {
    logWithSpinner('检测新版本中...');

    const {current, latest} = await getLatestVersion();
    if (semver.lt(current, latest)) {
        updateSpinner('🌟️', chalk.green(`发现新版本：${latest}`));
        stopSpinner();

        if (!verbose) {
            logWithSpinner('开始升级...稍等片刻...');
        }
        else {
            log('开始升级....');
        }

        updateCLI(cwd, verbose).then(() => {
            if (!verbose) {
                updateSpinner('升级成功');
                stopSpinner();
            }
            else {
                success('升级成功');
            }
        }).catch(e => {
            if (!verbose) {
                failSpinner('升级失败，请使用 npm 手动重试，或者升级 Node.js 版本后再次重试');
                log('使用 hulk upgrade --verbose 可以查看详细日志');
            }
        });
    }
    else {
        updateSpinner('检测完成，未发现最新版本');
        stopSpinner();
    }

};

function updateCLI(cwd, verbose) {

    return new Promise((resolve, reject) => {
        const child = execa('npm', [
            'install',
            name,
            '-g',
            `--registry=${registries.baidu}`
        ], {
            cwd,
            stdio: ['inherit', verbose ? process.stdout : 'inherit', verbose ? process.stderr : 'inherit']
        });

        child.on('close', code => {
            if (code !== 0) {
                reject(code);
                return;
            }

            resolve();
        });
    });
}
