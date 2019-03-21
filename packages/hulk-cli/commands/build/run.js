/**
 * @file run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = async (entry, args) => {
    // 1. 判断 entry 是 app.san app.js index.js等？还是目录
    // 目录直接操作
    // 如果是文件，需要设置 entry('app'),~entry
    const context = process.cwd();

    const {success, error} = require('@baidu/hulk-utils/logger');
    const {logWithSpinner, stopSpinner} = require('@baidu/hulk-utils/spinner');
    const fse = require('fs-extra');
    const chalk = require('chalk');
    const path = require('path');
    const webpack = require('webpack');

    // 处理 entry 不存在的情况
    const resolveEntry = require('../../lib/utils').resolveEntry;

    const obj = resolveEntry(entry);
    entry = obj.entry;
    const isFile = obj.isFile;

    const mode = args.mode || 'production'; // 默认是 production
    const isProduction = mode ? mode === 'production' : process.env.NODE_ENV === 'production';

    // 合并 config 的方式
    const modifyConfig = (config, fn) => {
        if (Array.isArray(config)) {
            config.forEach(c => fn(c));
        } else {
            fn(config);
        }
    };
    logWithSpinner(`Building for ${mode}...`);

    const Service = require('../../lib/Service');
    const plugins = [];
    if (args.analyze) {
        // 添加 analyze
        plugins.push(require('../../lib/serivce-plugins/analyze'));
    }
    const service = new Service(context, {
        configFile: args.config,
        plugins
    });
    const options = service.init(mode);

    // resolve webpack config
    const webpackConfig = service.resolveWebpackConfig();
    // console.log(webpackConfig);
    const targetDir = path.resolve(context, args.dest || options.outputDir);

    if (args.dest) {
        modifyConfig(webpackConfig, config => {
            config.output.path = targetDir;
        });
    }

    // watch 功能
    if (args.watch) {
        modifyConfig(webpackConfig, config => {
            config.watch = true;
        });
    }
    if (!args.clean) {
        // 删除 dist
        await fse.remove(targetDir);
    }

    webpackConfig.mode = isProduction ? 'production' : 'development';

    if (isFile) {
        if (/\.san$/.test(entry)) {
            webpackConfig.resolve.alias['~entry'] = path.resolve(context, entry);
        } else {
            webpackConfig.entry = {
                app: entry
            };
        }
    } else {
        delete webpackConfig.entry.app;
    }
    // 处理 entry 不存在的情况
    if (Object.keys(webpackConfig.entry).length === 0) {
        stopSpinner(false);
        error('没有找到 Entry，请命令后面添加 entry 或者配置 hulk.config.js');
        process.exit(1);
        return Promise.reject();
    }
    // console.log(webpackConfig.plugins[webpackConfig.plugins.length-1])
    // webpackConfig.output.publicPath = './';
    return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
            stopSpinner(false);
            if (err) {
                return reject(err);
            }

            if (stats.hasErrors()) {
                return reject('Build failed with errors.');
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

            resolve();
            if (!args.watch) {
                const targetDirShort = path.relative(context, targetDir);
                success(`Build complete. The ${chalk.cyan(targetDirShort)} directory is ready to be deployed.`);
                // 解决 apim 这类问题
                // process.exit(0);
            } else {
                success('Build complete. Watching for changes...');
            }
        });
    });
};
