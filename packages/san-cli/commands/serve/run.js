/**
 * @file serve run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {info, error} = require('../../../san-cli-utils/ttyLogger');
const devServer = require('../../webpack/serve');
const getNormalizeWebpackConfig = require('./getNormalizeWebpackConfig');
// 可以通过传入 api 和 options，获得 yarg 的 handler
// 方便 command 插件直接调用 run，得到 hanlder
// 为了扩展，需要增加webpack 和 dev-server 的配置回调
module.exports = function apply(api, projectOptions) {
    return async argv => {
        const mode = argv.mode;
        info(`Starting ${mode} server...`);

        const {publicPath} = projectOptions;
        const webpackConfig = getNormalizeWebpackConfig(api, projectOptions, argv);
        devServer({
            webpackConfig,
            publicPath,
            devServerConfig: webpackConfig.devServer,
            fail: ({type, stats, err}) => {
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
                } else {
                    error(err);
                }
            },
            success: ({isFirstCompile, networkUrl}) => {
                if (isFirstCompile) {
                    const {textColor} = require('san-cli-utils/randomColor');
                    /* eslint-disable no-console */
                    console.log();
                    console.log(`  Your application is running at: ${textColor(networkUrl)}`);
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
                                console.log('  ' + qrcode.split('\n').join('\n  '));
                            }
                        );
                    }
                }
            }
        });
    };
};
