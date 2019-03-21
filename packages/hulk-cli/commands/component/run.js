/**
 * @file run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const defaults = {
    host: '0.0.0.0',
    port: 8080,
    https: false
};
module.exports = async (entry, args) => {
    const context = process.cwd();
    const mode = args.mode;
    const isProduction = mode ? mode === 'production' : process.env.NODE_ENV === 'production';

    const {error, info} = require('@baidu/hulk-utils/logger');

    info(`Starting ${mode} server...`);

    const {updateNotifier, addDevClientToEntry} = require('../../lib/utils');

    const url = require('url');
    const path = require('path');

    const chalk = require('chalk');
    const webpack = require('webpack');
    const WebpackDevServer = require('webpack-dev-server');
    const portfinder = require('portfinder');

    const prepareUrls = require('@baidu/hulk-utils/prepare-urls').prepareUrls;
    const Service = require('../../lib/Service');

    const service = new Service(context, {
        configFile: args.config,
        plugins: [require('../../lib/serivce-plugins/component')]
    });
    const options = service.init(mode);

    // resolve webpack config
    const webpackConfig = service.resolveWebpackConfig();

    webpackConfig.resolve.alias['~entry'] = path.resolve(context, entry);
    webpackConfig.entry.app = require.resolve('../../template/component/main.js');

    const projectDevServerOptions = Object.assign(webpackConfig.devServer || {}, options.devServer);

    if (Object.keys(webpackConfig.entry).length === 0) {
        error('没有找到 Entry，请命令后面添加 entry 或者配置 hulk.config.js');
        process.exit(1);
        return Promise.reject();
    }
    // resolve server options
    const useHttps = args.useHttps || projectDevServerOptions.https || defaults.https;
    const protocol = useHttps ? 'https' : 'http';
    const host = args.host || projectDevServerOptions.host || defaults.host;
    portfinder.basePort = args.port || projectDevServerOptions.port || defaults.port;
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
            require.resolve(projectDevServerOptions.hotOnly ? 'webpack/hot/only-dev-server' : 'webpack/hot/dev-server')
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
                contentBase: path.resolve('public'),
                watchContentBase: !isProduction,
                hot: !isProduction,
                quiet: true,
                compress: isProduction,
                publicPath: options.baseUrl,
                overlay: isProduction ? false : {warnings: false, errors: true}
            },
            projectDevServerOptions,
            {
                https: useHttps,
                before(app, server) {
                    // allow other plugins to register middlewares, e.g. PWA
                    (projectDevServerOptions.middlewares || []).forEach(fn => fn(app, server));
                    // apply in project middlewares
                    projectDevServerOptions.before && projectDevServerOptions.before(app, server);
                }
            }
        )
    );

    updateNotifier(server);
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
};
