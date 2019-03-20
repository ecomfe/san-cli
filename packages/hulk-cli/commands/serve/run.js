/**
 * @file serve run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

const defaults = {
    host: '0.0.0.0',
    port: 8080,
    https: false
};

module.exports = async (entry, args) => {
    const info = require('@baidu/hulk-utils/logger').info;
    info('Starting development server...');

    const context = process.cwd();
    const chalk = require('chalk');
    const fse = require('fs-extra');
    const path = require('path');
    const url = require('url');

    // 1. 判断 entry 是文件还是目
    // 2. 文件，直接启动 file server
    // 3. 目录，则直接启动 devServer
    let isFile = false;

    if (entry) {
        try {
            const stats = fse.statSync(path.resolve(entry));
            if (stats.isFile()) {
                const ext = path.extname(entry);
                if (ext === '.js' || ext === '.san') {
                    isFile = true;
                    // 添加。~entry
                    entry = path.resolve(entry);
                } else {
                    console.log(chalk.red('Valid entry file should be one of: *.js or *.san.'));
                    process.exit(1);
                }
                isFile = true;
            }
        } catch (e) {
            console.log(chalk.red('Valid entry is not a file or directory.'));
            process.exit(1);
        }
    }

    let {version: pkgVersion, name: pkgName} = require('../../package.json');
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

    // 开始正式的操作
    const webpack = require('webpack');
    const WebpackDevServer = require('webpack-dev-server');
    const portfinder = require('portfinder');

    const prepareUrls = require('@baidu/hulk-utils/prepare-urls').prepareUrls;
    const Service = require('../../lib/Service');
    const mode = args.mode;
    const isProduction = mode ? mode === 'production' : process.env.NODE_ENV === 'production';
    const service = new Service(context, {
        configFile: args.config
    });
    const options = service.init(mode);

    // resolve webpack config
    const webpackConfig = service.resolveWebpackConfig();

    const projectDevServerOptions = Object.assign(webpackConfig.devServer || {}, options.devServer);
    // entry arg
    if (isFile) {
        if (/\.san$/.test(entry)) {
            webpackConfig.resolve.alias['~entry'] = path.resolve(context, entry);
        } else {
            webpackConfig.entry = {
                app: entry
            };
        }
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
