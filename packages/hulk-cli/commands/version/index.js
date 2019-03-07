const ora = require('ora');
/**
 * @file hulk -v 实现
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const semver = require('semver');
const chalk = require('chalk');
// eslint-disable-next-line
const {getLatestVersion} = require('@baidu/hulk-utils/get-latest-version');
const {startSpinner, stopSpinner, updateSpinner} = require('@baidu/hulk-utils/spinner');
const {version: current, name} = require('../../package.json');
const cliName = name.split('/').pop();
module.exports = program => {
    program.version(current, '-v --version').usage('<command> [options]');
    // 重新使用 version，带检查更新
    program.removeAllListeners('option:version').on('option:version', async () => {
        console.log(`${cliName} v${current}`);
        startSpinner({text: '检测新版本中...', color: 'magenta'});

        const latest = await getLatestVersion();

        if (semver.lt(current, latest)) {
            updateSpinner('🌟️', `发现新版本：${chalk.green(latest)}`);
        } else {
            updateSpinner('检测完成，未发现最新版本');
        }
        stopSpinner();
        process.exit(0);
    });
};
