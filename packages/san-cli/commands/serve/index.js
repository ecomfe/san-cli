/**
 * @file serve command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const getHandler = require('./run');
const command = (exports.command = 'serve [entry]');
const description = (exports.description = 'serve description');
const builder = (exports.builder = {
    'use-https': {
        type: 'boolean',
        default: false,
        describe: 'program specifications'
    },
    public: {
        type: 'string',
        describe: 'specify the public network URL for the HMR client'
    },
    port: {
        alias: 'p',
        default: 8888,
        type: 'number',
        describe: 'program specifications'
    },
    open: {
        alias: 'O',
        type: 'boolean',
        default: false,
        describe: 'Open Bowser after build'
    },
    host: {
        alias: 'H',
        type: 'string',
        describe: 'program specifications'
    },
    watch: {
        alias: 'w',
        type: 'boolean',
        default: false,
        describe: 'watch mode'
    },
    qrcode: {
        type: 'boolean',
        default: true,
        describe: 'program specifications'
    }
});
const servePlugin = {
    id: 'san-cli-command-serve',
    apply: getHandler(command, description, builder)
};

exports.handler = argv => {
    const getService = require('../getServiceInstance');
    const service = getService(argv, servePlugin);
    service.run('serve', argv);
    // resolve webpack config
};

exports.servePlugin = servePlugin;
