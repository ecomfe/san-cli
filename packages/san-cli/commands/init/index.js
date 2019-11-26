/**
 * @file init command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

exports.command = 'init <template> <app-name>';
exports.desc = 'Create an empty repo';
// TODO: 整理文案
exports.builder = {
    useCache: {
        default: false
    },
    verbose: {
        default: false
    },
    install: {
        default: false
    },
    offline: {
        default: false
    },
    force: {
        default: false
    },
    user: {
        default: 'git'
    },
    registry: {
        default: ''
    }
};
exports.handler = argv => {
    const {template, appName} = argv;
    require('san-cli-command-init')(template, appName, argv);
};
