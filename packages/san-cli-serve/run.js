/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file serve run
 * @author ksky521
 */

// 可以通过传入 api 和 options，获得 yarg 的 handler
// 方便插件直接调用 run，得到 handler
// 为了扩展，需要增加 webpack 和 dev-server 的配置回调
module.exports = function apply(argv, api) {
    const {info, error} = require('san-cli-utils/ttyLogger');
    const mode = argv.mode;
    info(`Starting ${mode} server...`);

    const Serve = require('san-cli-webpack/serve');
    const getNormalizeWebpackConfig = require('./getWebpackConfig');

    const projectConfigs = api.getProjectConfigs();
    const webpackConfig = getNormalizeWebpackConfig(api, projectConfigs, argv);
    const serve = new Serve(webpackConfig);
    serve.getServer().then(server => {
        ['SIGINT', 'SIGTERM'].forEach(signal => {
            process.on(signal, () => {
                server.close(() => {
                    serve.removeAllListeners();
                    process.exit(0);
                });
            });
        });

        server.listen(server.options.port, server.options.host, err => {
            if (err) {
                error('Local server start failed！', err);
                return;
            }
        });
    });
    serve.on('success', ({isFirstCompile, devServerConfig: ds, networkUrl}) => {
        if (isFirstCompile) {
            const {textCommonColor} = require('san-cli-utils/color');
            /* eslint-disable no-console */
            console.log();

            console.log(`  Application is running at: ${textCommonColor(networkUrl)}`);

            // 打开浏览器地址
            argv.open && require('opener')(networkUrl);

            if (argv.qrcode && !argv.dashboard) {
                console.log('  URL QRCode is: ');
                // 显示 terminal 二维码
                require('qrcode-terminal').generate(
                    networkUrl,
                    {
                        small: true
                    },
                    qrcode => {
                        // eslint-disable-next-line
                        const q = '  ' + qrcode.split('\n').join('\n  ');
                        console.log(q);
                    }
                );
            }

            if (argv.dashboard) {
                const {IpcMessenger} = require('san-cli-utils/ipc');
                const ipc = new IpcMessenger();
                ipc.send({
                    sanCliServe: {
                        url: networkUrl
                    }
                });
            }
            /* eslint-enable no-console */
        }
    });
    serve.on('fail', ({type, stats, err}) => {
        error(type === 'server' ? 'Local server start failed！' : '', err);
    });
    serve.run();
};
