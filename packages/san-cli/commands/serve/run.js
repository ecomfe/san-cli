/**
 * @file serve run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {info, error, chalk} = require('../../../san-cli-utils/ttyLogger');
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
                // TODO: 错误处理
                if (type === 'server') {
                    error('Local server start fail！');
                } else if (stats && stats.toJson) {
                    console.log('Build failed with errors.');
                    process.stderr.write(
                        stats.toString({
                            colors: !!argv.colors || !!argv.color,
                            children: false,
                            modules: false,
                            chunkModules: false
                        })
                    );
                } else {
                    console.log(err);
                }
            },
            success: ({isFirstCompile, networkUrl}) => {
                if (isFirstCompile) {
                    /* eslint-disable no-console */
                    console.log();
                    console.log(`  App running at: ${chalk.green(networkUrl)}`);
                    console.log();
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
                                console.log(qrcode);
                            }
                        );
                    }
                }
            }
        });
    };
};
