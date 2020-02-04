/**
 * @file serve command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const getHandler = require('./run');
const command = (exports.command = 'serve [entry]');
exports.aliases = ['dev'];
const description = (exports.description = 'Builds and serves your app, rebuilding on file changes');
const builder = (exports.builder = {
    'use-https': {
        type: 'boolean',
        default: false,
        describe: 'Enable https'
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
        describe: 'Operating environment'
    },
    config: {
        alias: 'config-file',
        type: 'string',
        describe: 'Project config file'
    },
    port: {
        alias: 'p',
        default: 8888,
        type: 'number',
        describe: 'Port number of the URL'
    },
    open: {
        alias: 'O',
        type: 'boolean',
        default: false,
        describe: 'Open Browser after the build is complete'
    },
    host: {
        alias: 'H',
        type: 'string',
        describe: 'Hostname of the URL'
    },
    qrcode: {
        type: 'boolean',
        default: true,
        describe: 'Print out the QRCode of the URL'
    }
});
const servePlugin = {
    id: 'san-cli-command-serve',
    apply(api, projectOptions) {
        // 注册命令
        api.registerCommand(command, getHandler(api, projectOptions));
    }
};

exports.handler = argv => {
    const getService = require('../../lib/getServiceInstance');
    const service = getService(argv, [servePlugin]);

    service.run('serve', argv);
};

exports.servePlugin = servePlugin;
