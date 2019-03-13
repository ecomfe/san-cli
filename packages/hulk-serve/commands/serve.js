/**
 * 部分代码来自 vue cli
 * @file serve 主要内容
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const defaults = {
    host: '0.0.0.0',
    port: 8080,
    https: false
};

module.exports = (api, options) => {
    api.registerCommand(
        'serve',
        async function serve(args) {
            const info = require('@baidu/hulk-utils/logger').info;
            const prepareUrls = require('@baidu/hulk-utils/prepare-urls').prepareUrls;

            info('Starting development server...');

            let {version: pkgVersion, name: pkgName} = args.pkg || {};
            let notifier;
            if (pkgVersion && pkgName) {
                const updateNotifier = require('update-notifier');

                // 检测版本更新
                notifier = updateNotifier({
                    pkg: {
                        name: pkgName,
                        version: pkgVersion
                    },
                    isGlobal: true,
                    // updateCheckInterval: 0,
                    // npm script 也显示
                    shouldNotifyInNpmScript: true
                });
            }

            const isProduction = process.env.NODE_ENV === 'production';
            const url = require('url');
            const path = require('path');
            const chalk = require('chalk');
            const webpack = require('webpack');

            const WebpackDevServer = require('webpack-dev-server');
            const portfinder = require('portfinder');

            // resolve webpack config
            const webpackConfig = api.resolveWebpackConfig();

            // load user devServer options with higher priority than devServer
            // in webpck config
            const projectDevServerOptions = Object.assign(webpackConfig.devServer || {}, options.devServer);
            // entry arg
            const entry = args._[0];
            if (entry) {
                webpackConfig.entry = {
                    app: api.resolve(entry)
                };
            }

            // resolve server options
            const useHttps = args.https || projectDevServerOptions.https || defaults.https;
            const protocol = useHttps ? 'https' : 'http';
            const host = args.host || process.env.HOST || projectDevServerOptions.host || defaults.host;
            portfinder.basePort = args.port || process.env.PORT || projectDevServerOptions.port || defaults.port;
            const port = await portfinder.getPortPromise();
            const rawPublicUrl = args.public || projectDevServerOptions.public;
            const publicUrl = rawPublicUrl
                ? /^[a-zA-Z]+:\/\//.test(rawPublicUrl)
                    ? rawPublicUrl
                    : `${protocol}://${rawPublicUrl}`
                : null;
            const urls = prepareUrls(protocol, host, port, options.baseUrl);
            // inject dev & hot-reload middleware entries
            if (!isProduction) {
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
                    require.resolve(
                        projectDevServerOptions.hotOnly ? 'webpack/hot/only-dev-server' : 'webpack/hot/dev-server'
                    )
                    // TODO custom overlay client
                    // `@vue/cli-overlay/dist/client`
                ];
                // inject dev/hot client
                addDevClientToEntry(webpackConfig, devClients);
            }

            // create compiler
            const compiler = webpack(webpackConfig);

            // create server
            const server = new WebpackDevServer(
                compiler,
                Object.assign(
                    {
                        clientLogLevel: 'none',
                        historyApiFallback: {
                            disableDotRule: true,
                            rewrites: [{from: /./, to: path.posix.join(options.baseUrl, 'index.html')}]
                        },
                        contentBase: api.resolve('public'),
                        watchContentBase: !isProduction,
                        hot: !isProduction,
                        quiet: true,
                        compress: isProduction,
                        publicPath: options.baseUrl,
                        overlay: isProduction // TODO disable this
                            ? false
                            : {warnings: false, errors: true}
                    },
                    projectDevServerOptions,
                    {
                        https: useHttps,
                        before(app, server) {
                            // allow other plugins to register middlewares, e.g. PWA
                            api.service.devServerConfigFns.forEach(fn => fn(app, server));
                            // apply in project middlewares
                            projectDevServerOptions.before && projectDevServerOptions.before(app, server);
                        }
                    }
                )
            );

            ['SIGINT', 'SIGTERM'].forEach(signal => {
                process.on(signal, () => {
                    server.close(() => {
                        notifier && notifier.notify();

                        process.exit(0);
                    });
                });
            });

            return new Promise((resolve, reject) => {
                // log instructions & open browser on first compilation complete
                let isFirstCompile = true;
                compiler.hooks.done.tap('hulk-cli-serve', stats => {
                    if (stats.hasErrors()) {
                        return;
                    }

                    console.log();
                    console.log('  App running at:');
                    const networkUrl = publicUrl ? publicUrl.replace(/([^/])$/, '$1/') : urls.lanUrlForTerminal;
                    console.log(`  - Network: ${chalk.cyan(networkUrl)}`);
                    console.log();

                    if (isFirstCompile) {
                        isFirstCompile = false;

                        // resolve returned Promise
                        // so other commands can do api.service.run('serve').then(...)
                        resolve({
                            server,
                            url: urls.localUrlForBrowser
                        });
                    }
                });

                server.listen(port, host, err => {
                    if (err) {
                        reject(err);
                    }
                });
            });
        }
    );
};

function addDevClientToEntry(config, devClient) {
    const {entry} = config;
    if (typeof entry === 'object' && !Array.isArray(entry)) {
        Object.keys(entry).forEach(key => {
            entry[key] = devClient.concat(entry[key]);
        });
    } else if (typeof entry === 'function') {
        config.entry = entry(devClient);
    } else {
        config.entry = devClient.concat(entry);
    }
}

module.exports.defaultModes = {
    serve: 'development'
};
