/**
 * @file serve command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

exports.command = 'serve';

exports.description = '';

exports.builder = {
    'use-https': {
        type: 'boolean',
        default: false,
        describe: 'program specifications'
    },
    'no-progress': {
        type: 'boolean',
        default: false,
        describe: 'program specifications'
    },
    port: {
        alias: 'p',
        default: 8888,
        type: 'number',
        describe: 'program specifications'
    },
    host: {
        alias: 'h',
        type: 'string',
        describe: 'program specifications'
    },
    mode: {
        alias: 'm',
        type: 'string',
        default: 'development',
        choices: ['development', 'production'],
        describe: 'program specifications'
    },
    c: {
        alias: 'config-file',
        type: 'string',
        describe: 'program specifications'
    },
    qrcode: {
        type: 'boolean',
        default: true,
        describe: 'program specifications'
    }
};
exports.handler = argv => {};
