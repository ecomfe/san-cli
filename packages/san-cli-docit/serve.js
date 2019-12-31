/**
 * @file serve
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {info, error} = require('@baidu/san-cli-utils/ttyLogger');

module.exports = function serve(argv, api, projectOptions) {
    const mode = argv.mode;

    info(`Starting ${mode} server...`);
    const {publicPath} = projectOptions;
    const getNormalizeWebpackConfig = require('./getNormalizeWebpackConfig');

    const webpackConfig = getNormalizeWebpackConfig(argv, api, projectOptions);

    const devServer = require('@baidu/san-cli-webpack/serve');

    devServer({
        webpackConfig,
        publicPath,
        devServerConfig: webpackConfig.devServer
    })
        .then(({isFirstCompile, networkUrl}) => {
            if (isFirstCompile) {
                const {textColor} = require('@baidu/san-cli-utils/randomColor');
                /* eslint-disable no-console */
                console.log();
                console.log(`  Application is running at: ${textColor(networkUrl)}`);
                console.log('  URL QRCode is: ');
                /* eslint-enable no-console */
                // 打开浏览器地址
                argv.open && require('opener')(networkUrl);

                if (argv.qrcode) {
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
            }
        })
        .catch(({type, stats, err}) => {
            if (type === 'server') {
                error('Local server start fail！', err);
            } else if (stats && stats.toJson) {
                // // TODO: 这里删掉，调试用的
                // process.stderr.write(
                //     stats.toString({
                //         colors: true,
                //         children: false,
                //         modules: false,
                //         chunkModules: false
                //     })
                // );
                const info = stats.toJson();
                error(info.errors);
            } else {
                error(err);
            }
        });
};
