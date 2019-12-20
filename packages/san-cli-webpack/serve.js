/**
 * @file webpack serve
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const url = require('url');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const portfinder = require('portfinder');

// webpack Plugins
const NameModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const SanFriendlyErrorsPlugin = require('./lib/SanFriendlyErrorsPlugin');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');

const {prepareUrls} = require('@baidu/san-cli-utils/path');
const {error, logger} = require('@baidu/san-cli-utils/ttyLogger');

const {addDevClientToEntry, getWebpackErrorInfoFromStats} = require('./utils');

const log = logger.withTag('webpack/serve');

module.exports = function devServer({webpackConfig, devServerConfig, publicPath, compilerCallback}) {
    return new Promise(async (resolve, reject) => {
        log.debug('serve start');
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

        // 添加插件
        // 在 serve 情况下添加
        webpackConfig.plugins.push(new NameModulesPlugin());
        webpackConfig.plugins.push(new SanFriendlyErrorsPlugin({clearConsole: false}));
        // 处理 tpl 的情况，smarty copy 到 output
        webpackConfig.plugins.push(new WriteFileWebpackPlugin({test: /\.tpl$/}));

        // create compiler
        let compiler;
        try {
            compiler = webpack(webpackConfig);
        } catch (e) {
            // 捕捉参数不正确的错误信息
            error('webpack compile error!', e);
            if (e instanceof webpack.WebpackOptionsValidationError) {
                process.exit(1);
            }
            throw e;
        }
        if (typeof compilerCallback === 'function') {
            compilerCallback(compiler);
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
                host
            })
        );

        // 记录是第一次编译：用于打开浏览器和输出第一次的 log
        let isFirstCompile = true;

        compiler.hooks.done.tap('san-cli-serve', stats => {
            log.debug('done');
            if (stats.hasErrors()) {
                const errObj = getWebpackErrorInfoFromStats(undefined, stats);
                errObj.type = 'webpack';

                return reject(errObj);
            }

            // 革命成功啦
            resolve({
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
                return reject({err, type: 'server'});
            }
        });
    });
};
