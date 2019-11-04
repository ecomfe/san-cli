/**
 * @file serve run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const {info, success: sucLog, error, chalk} = require('../../lib/ttyLogger');
const devServer = require('../../webpack/serve');

module.exports = (command, desc, builder) =>
    function apply(api, projectOptions, argv) {
        const handler = async argv => {
            const mode = argv.mode;
            info(`Starting ${mode} server...`);

            const {publicPath, devServer: projectDevServerOptions, devServerMiddlewares} = projectOptions;
            const webpackConfig = getNormalizeWebpackConfig(api, projectOptions, argv);

            devServer({
                webpackConfig,
                publicPath,
                devServerMiddlewares,
                devServerConfig: projectDevServerOptions,
                isQrCode: !!argv.qrcode,
                isOpenBrowser: !!argv.open,
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
                success: ({isFirstCompile, url, publicUrl}) => {
                    if (isFirstCompile) {
                        argv.open && require('opener')(url);
                        /* eslint-disable no-console */
                        console.log();
                        console.log('  App running at:');
                        const networkUrl = publicUrl ? publicUrl.replace(/([^/])$/, '$1/') : url;
                        console.log(`  - Network: ${chalk.cyan(networkUrl)}`);
                        console.log();
                        /* eslint-enable no-console */

                        if (argv.qrcode) {
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
                    } else {
                        // TODO： rebuild log
                        sucLog('Build success!');
                    }
                }
            });
        };

        // 注册命令
        api.registerCommand(command, {
            builder,
            desc,
            handler
        });
    };

function getNormalizeWebpackConfig(api, projectOptions, argv) {
    const {resolveEntry} = require('../../lib/utils');

    // 开始正式的操作
    const webpackConfig = api.resolveWebpackConfig();
    let entry = argv.entry;
    // entry arg
    if (entry) {
        // 1. 判断 entry 是文件还是目
        // 2. 文件，直接启动 file server
        // 3. 目录，则直接启动 devServer
        const obj = resolveEntry(api.resolve(entry));
        entry = obj.entry;
        const isFile = obj.isFile;

        if (isFile && !/\.san$/.test(entry)) {
            webpackConfig.entry.app = entry;
        } else {
            // san 文件/目录的情况需要指定 ~entry
            webpackConfig.resolve.alias['~entry'] = api.resolve(entry);
        }
    }
    if (!webpackConfig.entry || Object.keys(webpackConfig.entry).length === 0) {
        error('没有找到 Webpack.entry，请命令后面添加 entry 或者配置 san.config.js pages');
        process.exit(1);
    }
}
