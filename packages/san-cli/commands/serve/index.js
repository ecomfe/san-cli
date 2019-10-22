/**
 * @file serve command
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const command = (exports.command = 'serve [entry]');
const description = (exports.description = 'serve description');
const builder = (exports.builder = {
    'use-https': {
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
    apply(api, options, argv) {
        api.registerCommand(command, {
            builder,
            description,
            handler: argv => {
                const webpackConfig = api.resolveWebpackConfig();
                console.log(webpackConfig);
                // TODO: target 处理
            }
        });
    }
};

exports.handler = argv => {
    const getService = require('../getServiceInstance');
    const service = getService(argv, servePlugin);
    service.run('serve', argv);
    // resolve webpack config
};

exports.servePlugin = servePlugin;
