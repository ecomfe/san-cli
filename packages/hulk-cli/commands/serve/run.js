/**
 * @file serve run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

/* eslint-disable no-console */
async function serve(app, entry, args, command = 'serve', plugins = []) {
    const context = process.cwd();
    const isFile = app && entry;
    const mode = args.mode;
    const {PRODUCTION_MODE} = require('../../constants'); // eslint-disable-line
    const isProduction = mode ? mode === PRODUCTION_MODE : process.env.NODE_ENV === PRODUCTION_MODE;

    const {info, error} = require('@baidu/hulk-utils/logger');
    // 默认配置
    const {devServer: defaults} = require('../../lib/defaultConfig'); // eslint-disable-line

    info(`Starting ${mode} server...`);

    const path = require('path');
    const url = require('url');

    const chalk = require('@baidu/hulk-utils/chalk');

    const webpack = require('webpack');
    const WebpackDevServer = require('webpack-dev-server');
    const portfinder = require('portfinder');

    const prepareUrls = require('@baidu/hulk-utils/prepare-urls').prepareUrls;

    const {updateNotifier, addDevClientToEntry} = require('../../lib/utils');

    // 添加 serve 的 service-plugins
    plugins.push(require('../../lib/serivce-plugins/commandServe'));

    if (args.matrixEnv) {
        // 添加 analyze
        plugins.push(require('../../lib/serivce-plugins/matrix'));
    }

    // 开始正式的操作
    const Service = require('../../lib/Service');

    const service = new Service(context, {
        configFile: args.config,
        plugins
    });

    const options = service.init(
        mode,
        Object.assign(args, {
            target: args.target ? args.target : isFile ? 'page' : 'app',
            modernBuild: args.modern && process.env.HULK_CLI_MODERN_BUILD,
            command
        })
    );

    // resolve webpack config
    const webpackConfig = service.resolveWebpackConfig();

    const projectDevServerOptions = Object.assign(webpackConfig.devServer || {}, options.devServer);
    // entry arg
    if (entry) {
        webpackConfig.resolve.alias['~entry'] = path.resolve(context, entry);
    }

    if (app) {
        if (typeof app === 'object') {
            webpackConfig.entry = app;
        } else {
            webpackConfig.entry.app = app;
        }
    }

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
            require.resolve(!projectDevServerOptions.hotOnly ? 'webpack/hot/only-dev-server' : 'webpack/hot/dev-server')
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
        console.log('webpack compile error!'); // eslint-disable-line no-console
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
        publicPath: options.baseUrl
    };
    if (isFile) {
        // 不显示列表，直接显示首页 index.html
        defaultDevServer.historyApiFallback = {
            disableDotRule: true,
            rewrites: [{from: /./, to: path.posix.join(options.baseUrl, 'index.html')}]
        };
    }

    const server = new WebpackDevServer(
        compiler,
        Object.assign(defaultDevServer, projectDevServerOptions, {
            https: useHttps,
            before(app, server) {
                // allow other plugins to register middlewares, e.g. PWA
                (options.middlewares || []).forEach(fn => app.use(fn()));
                // apply in project middlewares
                projectDevServerOptions.before && projectDevServerOptions.before(app, server);
            }
        })
    );

    updateNotifier(server);
    return new Promise((resolve, reject) => {
        // log instructions & open browser on first compilation complete
        let isFirstCompile = true;
        const qrcode = require('qrcode-terminal');

        compiler.hooks.done.tap('hulk-cli-serve', stats => {
            if (stats.hasErrors()) {
                reject(stats.toString({colors: true, all: false, errors: true}));
                return;
            }

            /* eslint-disable no-console */
            console.log();
            console.log('  App running at:');
            const networkUrl = publicUrl ? publicUrl.replace(/([^/])$/, '$1/') : urls.lanUrlForTerminal;
            console.log(`  - Network: ${chalk.cyan(networkUrl)}`);
            console.log();
            /* eslint-enable no-console */

            if (args.qrcode) {
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

module.exports = (entry, args) => {
    // eslint-disable-next-line
    const {resolveEntry} = require('../../lib/utils');
    // 1. 判断 entry 是文件还是目
    // 2. 文件，直接启动 file server
    // 3. 目录，则直接启动 devServer
    const obj = resolveEntry(entry);
    entry = obj.entry;
    const isFile = obj.isFile;
    let app;

    if (isFile && !/\.san$/.test(entry)) {
        app = entry;
        entry = undefined;
    }
    // eslint-disable-next-line
    return serve(app, entry, args).catch(err => console.log(err));
};
module.exports.serve = serve;
