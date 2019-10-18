/**
 * @file build command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
exports.command = 'build [entry]';

exports.description = 'build description';

exports.builder = {
    target: {
        type: 'string',
        default: 'app',
        choices: ['app', 'lib', 'component'],
        describe: ''
    },
    'no-progress': {
        type: 'boolean',
        default: false,
        describe: 'program specifications'
    },
    mode: {
        alias: 'm',
        type: 'string',
        default: 'production',
        choices: ['development', 'production'],
        describe: 'program specifications'
    },
    watch: {
        alias: 'w',
        type: 'boolean',
        default: false,
        describe: 'watch mode'
    },
    c: {
        alias: 'config-file',
        type: 'string',
        describe: 'program specifications'
    }
};

exports.handler = argv => {
};
