/**
 * @file serve command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// TODO: 整理文案

const getHandler = require('./run');
const command = (exports.command = 'serve [entry]');
exports.aliases = ['dev'];
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
    mode: {
        alias: 'm',
        type: 'string',
        default: 'development',
        choices: ['development', 'production'],
        describe: 'program specifications'
    },
    config: {
        type: 'string',
        describe: 'program specifications'
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
    apply(api, projectOptions) {
        // 注册命令
        api.registerCommand(command, {
            builder,
            description,
            handler: getHandler(api, projectOptions)
        });
    }
};

exports.handler = argv => {
    const getService = require('../../lib/getServiceInstance');
    const service = getService(argv, [servePlugin]);

    service.run('serve', argv);
};

exports.servePlugin = servePlugin;
