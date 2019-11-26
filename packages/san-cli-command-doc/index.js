/**
 * @file command Component
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fs = require('fs');
const builder = {
    'use-https': {
        type: 'boolean',
        default: false,
        describe: 'program specifications'
    },
    public: {
        type: 'string',
        describe: 'specify the public network URL for the HMR client'
    },
    port: {
        alias: 'p',
        default: 8888,
        type: 'number',
        describe: 'program specifications'
    },
    open: {
        alias: 'O',
        type: 'boolean',
        default: false,
        describe: 'Open Bowser after build'
    },
    mode: {
        alias: 'm',
        type: 'string',
        default: 'development',
        choices: ['development', 'production'],
        describe: 'program specifications'
    },
    host: {
        alias: 'H',
        type: 'string',
        describe: 'program specifications'
    },
    watch: {
        alias: 'w',
        type: 'boolean',
        default: false,
        describe: 'watch mode'
    },
    qrcode: {
        type: 'boolean',
        default: true,
        describe: 'program specifications'
    }
};
const describe = '';
module.exports = {
    id: 'san-cli-command-component',
    apply(api, projectOptions) {
        // 增加一些配置
        const context = api.getCwd();
        const HTMLPlugin = require('html-webpack-plugin');
        // 增加 md loader
        // 来自 san.config.js component 扩展的配置
        api.chainWebpack(webpackConfig => {
            const {template, ignore} = projectOptions.component || {};
            webpackConfig.module
                .rule('md')
                .test(/\.md$/)
                .use('markdown')
                .loader(require.resolve('hulk-markdown-loader'))
                .options({context, template, ignore});

            // html 模板
            const htmlPath = api.resolve('public/index.html');
            const htmlOptions = {
                inject: true,
                alwaysWriteToDisk: false, // 不写到本地，tpl 需要，我们不需要
                template: fs.existsSync(htmlPath) ? htmlPath : path.resolve(__dirname, './template/index.html')
            };
            webpackConfig
                .entry('app')
                .add(require.resolve('./template/main.js'))
                .end();

            // default, single page setup.
            webpackConfig.plugin('html').use(HTMLPlugin, [htmlOptions]);
        });
        // api.configureWebpack(webpackConfig => {
        //     webpackConfig.entry = {};
        // });

        // 给 service 注册命令
        api.registerCommand('doc [entry]', {
            builder,
            describe,
            aliases: ['play', 'md', 'doc'],
            handler(argv) {
                const {info, error} = require('san-cli-utils/ttyLogger');
                const mode = argv.mode;
                info(`Starting ${mode} server...`);

                const devServer = require('san-cli-webpack/serve');

                const {publicPath} = projectOptions;
                const webpackConfig = getNormalizeWebpackConfig(api, projectOptions, argv);
                devServer({
                    webpackConfig,
                    publicPath,
                    devServerConfig: webpackConfig.devServer,
                    fail: ({type, stats, err}) => {
                        if (type === 'server') {
                            error('Local server start fail！', err);
                        } else if (stats && stats.toJson) {
                            // // TODO: 这里删掉，调试用的
                            // process.stderr.write(
                            //     stats.toString({
                            //         colors: true,
                            //         children: false,
                            //         modules: false,
                            //         chunkModules: false
                            //     })
                            // );
                        } else {
                            error(err);
                        }
                    },
                    success: ({isFirstCompile, networkUrl}) => {
                        if (isFirstCompile) {
                            const {textColor} = require('san-cli-utils/randomColor');
                            /* eslint-disable no-console */
                            console.log();
                            console.log(`  Your application is running at: ${textColor(networkUrl)}`);
                            console.log('  URL QRCode is: ');
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
                                        const q = '  ' + qrcode.split('\n').join('\n  ');
                                        console.log(q);
                                    }
                                );
                            }
                        }
                    }
                });
            }
        });
    }
};

function getNormalizeWebpackConfig(api, projectOptions, argv) {
    const {resolveEntry} = require('san-cli-webpack/utils');
    const isProd = api.isProd();
    // 开始正式的操作
    let webpackConfig = api.resolveWebpackConfig();
    const entry = argv.entry;

    webpackConfig = resolveEntry(entry, api.resolve(entry), webpackConfig, require.resolve('./template/main.js'));
    webpackConfig.devServer = Object.assign({hot: !isProd, compress: isProd}, webpackConfig.devServer);
    return webpackConfig;
}
