/**
 * @file init command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

exports.command = 'init <template> <app-name>';
exports.desc = 'Create an empty repo';
// TODO: 整理文案
exports.builder = {
    useCache: {
        alias: 'cache',
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
    username: {
        alias: 'u',
        default: ''
    },
    registry: {
        alias: 'r',
        default: ''
    }
};
exports.handler = argv => {
    const {template, appName} = argv;
    require('./run')(template, appName, argv);
};
