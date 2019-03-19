/**
 * 部分代码来自 vue cli
 * @file build 主要内容
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const modifyConfig = (config, fn) => {
    if (Array.isArray(config)) {
        config.forEach(c => fn(c));
    } else {
        fn(config);
    }
};
module.exports = (api, options) => {
    api.registerCommand('build', async args => {
        const {info, success} = require('@baidu/hulk-utils/logger');
        const {logWithSpinner, stopSpinner} = require('@baidu/hulk-utils/spinner');
        const fse = require('fs-extra');
        const chalk = require('chalk');
        const path = require('path');
        const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

        logWithSpinner('Building for production...');

        process.env.NODE_ENV = 'production';

        const webpack = require('webpack');

        // resolve webpack config
        const webpackConfig = api.resolveWebpackConfig();
        const entry = args._entry;
        if (entry) {
            try {
                const stats = fse.statSync(api.resolve(entry));
                if (!stats.isFile()) {
                    delete webpackConfig.entry.app;
                }
            } catch (e) {
                delete webpackConfig.entry.app;
            }
        } else {
            delete webpackConfig.entry.app;
        }
        // console.log(webpackConfig);

        const targetDir = api.resolve(args.dest || options.outputDir);
        if (args.dest) {
            modifyConfig(webpackConfig, config => {
                config.output.path = targetDir;
            });
        }

        if (args.watch) {
            modifyConfig(webpackConfig, config => {
                config.watch = true;
            });
        }
        if (!args.clean) {
            // 删除 dist
            await fse.remove(targetDir);
        }
        if (args.analyze) {
            // args.analyze
            modifyConfig(webpackConfig, config => {
                config.plugins.push(new BundleAnalyzerPlugin());
            });
        }
        webpackConfig.mode = 'production';

        // webpackConfig.output.publicPath = './';
        return new Promise((resolve, reject) => {
            webpack(webpackConfig, (err, stats) => {
                stopSpinner(false);
                if (err) {
                    return reject(err);
                }
                if (!args.analyze) {
                    process.stdout.write(
                        stats.toString({
                            colors: true,
                            modules: false,
                            children: false,
                            chunks: false,
                            chunkModules: false
                        }) + '\n'
                    );
                }

                if (stats.hasErrors()) {
                    return reject('Build failed with errors.');
                }
                if (!args.watch) {
                    const targetDirShort = path.relative(api.service.context, targetDir);
                    success(`Build complete. The ${chalk.cyan(targetDirShort)} directory is ready to be deployed.`);
                } else {
                    success('Build complete. Watching for changes...');
                }
                resolve();
            });
        });
    });
};

module.exports.defaultModes = {
    build: 'production'
};
