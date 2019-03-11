const ora = require('ora');
/**
 * @file hulk -v 实现
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const updateNotifier = require('update-notifier');

// eslint-disable-next-line
const {version, name} = require('../../package.json');
const cliName = name.split('/').pop();
module.exports = program => {
    program.version(version, '-v --version').usage('<command> [options]');
    // 重新使用 version，带检查更新
    program.removeAllListeners('option:version').on('option:version', async () => {
        console.log(`${cliName} v${version}`);
        updateNotifier({
            pkg: {
                name,
                version
            },
            isGlobal: true,
            // updateCheckInterval: 0,
            // npm script 也显示
            shouldNotifyInNpmScript: true
        }).notify();
        process.exit(0);
    });
};
