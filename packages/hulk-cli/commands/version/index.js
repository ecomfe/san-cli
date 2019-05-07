/**
 * @file hulk -v 实现
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const updateNotifier = require('update-notifier');

// eslint-disable-next-line
const {version, name} = require('../../package.json');
module.exports = program => {
    program.version(version, '-v --version');
    // 重新使用 version，带检查更新
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
};
