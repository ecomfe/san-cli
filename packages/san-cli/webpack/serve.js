/**
 * @file webpack serve
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const url = require('url');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const portfinder = require('portfinder');

const {addDevClientToEntry, getWebpackErrorInfoFromStats} = require('san-cli-utils/webpack');
const {prepareUrls} = require('san-cli-utils/path');
const debug = require('../lib/debug');

const log = debug('webpack/serve');
module.exports = async function devServer({
    webpackConfig,
    devServerMiddlewares,
    devServerConfig,
    publicPath,
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

        // 革命成功啦
        success({
            stats,
            server,
            isFirstCompile,
            port,
            protocol,
            publicUrl,
            url: urls.localUrlForBrowserz,
            networkUrl: publicUrl
                ? publicUrl.replace(/([^/])$/, '$1/')
                : url.format({
                      /* eslint-disable fecs-indent */
                      protocol,
                      port,
                      hostname: urls.lanUrlForConfig || 'localhost'
                  }),
            /* eslint-enable fecs-indent */
            urls
        });
        if (isFirstCompile) {
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

    server.listen(port, host, err => {
        if (err) {
            fail({err, type: 'server'});
            return;
        }
    });
};
