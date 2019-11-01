/**
 * @file webpack serve
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const url = require('url');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const portfinder = require('portfinder');
const qrcode = require('qrcode-terminal');

const argsert = require('../lib/argsert');
const {prepareUrls, addDevClientToEntry, resolveEntry} = require('../lib/utils');
const {chalk, getWebpackErrorInfoFromStats, debug} = require('../lib/ttyLogger');

const log = debug('webpack/serve');
module.exports = async function devServer({
    webpackConfig,
    devServerMiddlewares,
    devServerConfig,
    publicPath,
    beforeServer,
    afterServer,
    isQrCode = true,
    isOpenBrowser = false,
    success,
    fail
}) {
    if (typeof success !== 'function') {
        success = () => {};
    }
    if (typeof fail !== 'function') {
        fail = () => {};
    }

    log.info('start');
    const {https, host, port: basePort, public: rawPublicUrl, hotOnly} = devServerConfig;
    const protocol = https ? 'https' : 'http';
    portfinder.basePort = basePort;
    // 查找空闲的 port
    const port = await portfinder.getPortPromise();
    const publicUrl = rawPublicUrl
        ? /^[a-zA-Z]+:\/\//.test(rawPublicUrl)
            ? rawPublicUrl
            : `${protocol}://${rawPublicUrl}`
        : null;
    const urls = prepareUrls(protocol, host, port, publicPath);
    // mode 不是 production 则添加 hmr 功能
    if (webpackConfig.mode !== 'production') {
        /* eslint-disable*/
        const sockjsUrl = publicUrl
            ? `?${publicUrl}/sockjs-node`
            : `?${url.format({
                  protocol,
                  port,
                  hostname: urls.lanUrlForConfig || 'localhost',
                  pathname: '/sockjs-node'
              })}`;
        /* eslint-enable*/

        const devClients = [
            // dev server client
            require.resolve('webpack-dev-server/client') + sockjsUrl,
            // hmr client
            require.resolve(hotOnly ? 'webpack/hot/dev-server' : 'webpack/hot/only-dev-server')
        ];
        // inject dev/hot client
        addDevClientToEntry(webpackConfig, devClients);
    }
    // create compiler
    let compiler;
    try {
        compiler = webpack(webpackConfig);
    } catch (e) {
        // 捕捉参数不正确的错误信息
        log.warn('webpack compile error!');
        if (e instanceof webpack.WebpackOptionsValidationError) {
            console.error(e.message); // eslint-disable-line no-console
            process.exit(1);
        }
        throw e;
    }
    // create server
    const defaultDevServer = {
        // 这里注意，这个配置的是 outputDir
        contentBase: path.resolve('public'),
        // 这里注意：
        // 如果是 contentBase = outputDir 谨慎打开，打开后 template 每次文件都会重写，从而导致 hmr 失效，每次都 reload 页面
        watchContentBase: false,
        publicPath
    };

    const server = new WebpackDevServer(
        compiler,
        Object.assign(defaultDevServer, devServerConfig, {
            https,
            port,
            host,
            before(app, server) {
                // allow other plugins to register middlewares, e.g. PWA
                (devServerMiddlewares || []).forEach(fn => app.use(fn()));
                // apply in project middlewares
                devServerConfig.before && devServerConfig.before(app, server);
            }
        })
    );

    // 记录是第一次编译：用于打开浏览器和输出第一次的 log
    let isFirstCompile = true;

    compiler.hooks.done.tap('san-cli-serve', stats => {
        log.info('done');
        if (stats.hasErrors()) {
            const errObj = getWebpackErrorInfoFromStats(undefined, stats);
            errObj.type = 'webpack';
            fail(errObj);
            return;
        }

        /* eslint-disable no-console */
        console.log();
        console.log('  App running at:');
        const networkUrl = publicUrl ? publicUrl.replace(/([^/])$/, '$1/') : urls.lanUrlForTerminal;
        console.log(`  - Network: ${chalk.cyan(networkUrl)}`);
        console.log();
        /* eslint-enable no-console */

        if (isQrCode) {
            qrcode.generate(
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
        // 革命成功啦
        success({
            stats,
            server,
            isFirstCompile,
            port,
            url: urls.localUrlForBrowser
        });
        if (isFirstCompile) {
            isOpenBrowser && require('react-dev-utils/openBrowser')(urls.localUrlForBrowser);
            // 重置一下
            isFirstCompile = false;
        }
    });

    ['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, () => {
            server.close(() => {
                process.exit(0);
            });
        });
    });

    if (typeof beforeServer === 'function') {
        beforeServer(server);
    }

    server.listen(port, host, err => {
        if (err) {
            fail({err, type: 'server'});
            return;
        }

        if (typeof afterServer === 'function') {
            afterServer(server, port);
        }
    });
};
