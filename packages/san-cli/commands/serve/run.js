/**
 * @file serve run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
module.exports = (command, desc, builder) =>
    function apply(api, projectOptions, argv) {
        const handler = async argv => {
            const mode = argv.mode;
            const isProduction = mode ? mode === 'production' : process.env.NODE_ENV === 'production';
            const {info, error, chalk} = require('../../lib/ttyLogger');
            info(`Starting ${mode} server...`);

            // require sth..
            const path = require('path');
            const url = require('url');

            const webpack = require('webpack');
            const WebpackDevServer = require('webpack-dev-server');
            const portfinder = require('portfinder');

            const {prepareUrls, addDevClientToEntry, resolveEntry} = require('../../lib/utils');

            // 开始正式的操作
            const webpackConfig = api.resolveWebpackConfig();
            const {publicPath, devServer: projectDevServerOptions, devServerMiddlewares} = projectOptions;
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
                return Promise.reject();
            }
            // resolve server options
            const {
                useHttps = projectDevServerOptions.https,
                host = projectDevServerOptions.host,
                port: basePort = projectDevServerOptions.port,
                public: rawPublicUrl = projectDevServerOptions.public
            } = argv;
            const protocol = useHttps ? 'https' : 'http';
            portfinder.basePort = basePort;
            const port = await portfinder.getPortPromise();
            const publicUrl = rawPublicUrl
                ? /^[a-zA-Z]+:\/\//.test(rawPublicUrl)
                    ? rawPublicUrl
                    : `${protocol}://${rawPublicUrl}`
                : null;
            const urls = prepareUrls(protocol, host, port, publicPath);
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
                        !projectDevServerOptions.hotOnly ? 'webpack/hot/only-dev-server' : 'webpack/hot/dev-server'
                    )
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
                publicPath
            };

            const server = new WebpackDevServer(
                compiler,
                Object.assign(defaultDevServer, projectDevServerOptions, {
                    https: useHttps,
                    before(app, server) {
                        // allow other plugins to register middlewares, e.g. PWA
                        (devServerMiddlewares || []).forEach(fn => app.use(fn()));
                        // apply in project middlewares
                        projectDevServerOptions.before && projectDevServerOptions.before(app, server);
                    }
                })
            );

            return new Promise((resolve, reject) => {
                // log instructions & open browser on first compilation complete
                let isFirstCompile = true;
                const qrcode = require('qrcode-terminal');

                compiler.hooks.done.tap('san-cli-serve', stats => {
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

                    if (argv.qrcode) {
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

        // 注册命令
        api.registerCommand(command, {
            builder,
            desc,
            handler
        });
    };
