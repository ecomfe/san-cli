/**
 * @file 检查更新显示 version
 */

const {
    logWithSpinner,
    stopSpinner,
    getLatestVersion,
    updateSpinner,
    log
} = require('../lib/utils');
const semver = require('semver');
const chalk = require('chalk');

const {name, version} = require('../package');
module.exports = async () => {
    const cliName = name.split('/').pop();
    log(`${cliName} 当前版本 v${version}`);
    logWithSpinner('检测新版本中...');

    const {current, latest} = await getLatestVersion();

    if (semver.lt(current, latest)) {
        updateSpinner('🌟️', chalk.green(`发现新版本：${latest}`));
    }
    else {
        updateSpinner('检测完成，未发现最新版本');
    }
    stopSpinner();
    process.exit(0);
};
