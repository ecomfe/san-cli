/**
 * @file run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = async (entry, args) => {
    // 开始时间
    const startTime = Date.now();
    const {success, error, info} = require('@baidu/hulk-utils/logger');
    const mode = args.mode || 'production'; // 默认是 production
    info(`Building for ${mode}...`);

    const context = process.cwd();
    const isProduction = mode ? mode === 'production' : process.env.NODE_ENV === 'production';

    // 1. 判断 entry 是 app.san app.js index.js等？还是目录
    // 目录直接操作
    // 如果是文件，需要设置 entry('app'),~entry

    const fse = require('fs-extra');
    const chalk = require('chalk');
    const path = require('path');
    const webpack = require('webpack');
    const formatStats = require('../../lib/formatStats');

    // 处理 entry 不存在的情况
    const resolveEntry = require('../../lib/utils').resolveEntry;

    const obj = resolveEntry(entry);
    entry = obj.entry;
    const isFile = obj.isFile;

    // 合并 config 的方式
    const modifyConfig = (config, fn) => {
        if (Array.isArray(config)) {
            config.forEach(c => fn(c));
        } else {
            fn(config);
        }
    };

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

    const options = service.init(mode, {
        target: args.target ? args.target : isFile ? 'page' : 'app',
        modernMode: args.modern,
        modernBuild: args.modern && process.env.HULK_CLI_MODERN_BUILD,
        command: 'build'
    });

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
        error('没有找到 Entry，请命令后面添加 entry 或者配置 hulk.config.js');
        process.exit(1);
        return Promise.reject();
    }
    // console.log(webpackConfig.plugins[webpackConfig.plugins.length-1])
    // webpackConfig.output.publicPath = './';
    // webpackConfig.optimization.runtimeChunk = true;
    webpack(webpackConfig, (err, stats) => {
        if (err) {
            console.log(err);
            process.exit(1);
            return;
        }

        if (stats.hasErrors()) {
            console.log('Build failed with errors.');
            process.stderr.write(stats.toString({colors: true, children: false, modules: false, chunkModules: false}));
            process.exit(1);
            return;
        }

        const targetDirShort = path.relative(context, targetDir);

        stats = stats.toJson({
            all: false,
            entrypoints: true,
            assets: true,
            chunks: true,
            version: true,
            timings: true,
            performance: true
        });

        if (!args.analyze) {
            console.log(
                formatStats(stats, targetDirShort, {
                    resolve: p => path.resolve(context, p)
                })
            );
        }

        if (!args.watch) {
            const duration = (Date.now() - startTime) / 1e3;
            const {time, version} = stats;
            // const targetDirShort = path.relative(context, targetDir);
            success(
                `The ${chalk.cyan(targetDirShort)} directory is ready to be deployed. Duration ${chalk.cyan(
                    `${duration}/${time / 1e3}s`
                )}, Webpack ${version}.`
            );
            // 解决 apim 这类问题
            // process.exit(0);
        } else {
            success('Build complete. Watching for changes...');
        }
    });
};
