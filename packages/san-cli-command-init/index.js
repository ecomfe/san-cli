/**
 * @file init command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

exports.command = 'init <template> <app-name>';
exports.desc = 'Create an empty repo';
exports.builder = {
    useCache: {
        alias: 'cache',
        default: false,
        describe: 'Use local cache'
    },
    install: {
        default: false,
        describe: 'Install npm packages after initialization'
    },
    offline: {
        default: false,
        describe: 'Prefer to use local offline packages'
    },
    force: {
        default: false,
        describe: 'Forced coverage'
    },
    username: {
        alias: 'u',
        default: '',
        describe: 'Specify the username used by git clone command'
    },
    registry: {
        alias: 'r',
        default: '',
        describe: 'Specify npm package download registry'
    }
};
exports.handler = argv => {
    const {template, appName} = argv;

    let {templateAlias: templateAliasMap} = argv._presets || {};
    const options = Object.assign({}, argv, {templateAliasMap});
    require('./run')(template, appName, options);
};
