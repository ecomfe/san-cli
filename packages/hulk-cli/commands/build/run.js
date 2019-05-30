/**
 * @file run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
/* eslint-disable no-console */
const path = require('path');
const {success, error, info} = require('@baidu/hulk-utils/logger');
const context = process.cwd();

// 合并 config 的方式
const modifyConfig = (config, fn) => {
    if (Array.isArray(config)) {
        config.forEach(c => fn(c));
    } else {
        fn(config);
    }
};
/* eslint-disable fecs-valid-jsdoc */
/**
 * 打包流程，这里可以单独给其他模块使用
 * initEntry，是 hulk build [entry]传入的 entry，默认不传则使用 hulk.config.js 配置 pages 打包
 * args 是 hulk Build 的 optional arguments
 * plugins 是专门给 import 模式使用的参数，传入 Service plugin，参考 lib/serivce-plugins
 */
module.exports = async (initEntry, args, plugins = []) => {
    // 开始时间
    const startTime = Date.now();
    const chalk = require('@baidu/hulk-utils/chalk');

    // 1. 处理 entry 不存在的情况， entry 是 hulk build [entry]传入的optional arguments
    const resolveEntry = require('../../lib/utils').resolveEntry;
    args.entry = initEntry;
    if (initEntry) {
        const {entry, isFile} = resolveEntry(initEntry);
        args.entry = entry;
        args.target = isFile ? 'entry' : 'app';
    } else {
        args.target = 'app';
    }

    const mode = args.mode || process.env.NODE_ENV || 'production'; // 默认是 production
    args.mode = mode;

    if (args.modern && args.analyze) {
        // --modern + --analyze 应该显示 modern 的 analyze 的结果
        process.env.HULK_CLI_MODERN_BUILD = true;
    }

    const bundleTag = args.modern ? (process.env.HULK_CLI_MODERN_BUILD ? 'modern bundle ' : 'legacy bundle ') : '';
    info(`Building ${bundleTag}for ${mode}...`);

    /**
     * 失败处理逻辑
     * @param {Error|Stats} err - error 对象
     */
    function failBuild(err) {
        if (err && err.toJson) {
            console.log('Build failed with errors.');
            process.stderr.write(
                err.toString({
                    colors: !!args.colors || !!args.color,
                    children: false,
                    modules: false,
                    chunkModules: false
                })
            );
            process.exit(1);
        } else {
            console.log(err);
        }
    }

    // 编译成功处理逻辑
    function successBuild({stats: webpackStats, config, options}, {isModern, isModernBuild} = {}) {
        if (!args.analyze) {
            // 只有在非 analyze 模式下才会输出 log
            const targetDir = path.resolve(context, config.output.path || args.dest || options.outputDir);
            const targetDirShort = path.relative(context, targetDir);
            const stats = webpackStats.toJson({
                all: false,
                entrypoints: true,
                assets: true,
                chunks: true,
                version: true,
                timings: true,
                performance: true
            });

            if (args.verbose) {
                args.stats = 'verbose';
            }
            if (args.stats === 'table') {
                console.log(
                    require('../../lib/report')(stats, targetDirShort, {
                        resolve: p => path.resolve(context, p)
                    })
                );
            } else {
                const Stats = require('webpack/lib/Stats');
                const statsOptions = Stats.presetToOptions(args.stats);
                statsOptions.colors = !!args.colors || !!args.color;
                console.log(webpackStats.toString(statsOptions));
            }
            if (!args.watch) {
                const duration = (Date.now() - startTime) / 1e3;
                if (isModern) {
                    if (isModernBuild) {
                        success('Build modern bundle success');
                    } else {
                        success('Build legacy bundle success');
                        console.log();
                    }
                    return;
                }
                const {time, version} = stats;
                success(
                    `The ${chalk.cyan(targetDirShort)} directory is ready to be deployed. Duration ${chalk.cyan(
                        `${duration}/${time / 1e3}s`
                    )}, Webpack ${version}.`
                );
            }
        }
        if (args.watch) {
            success('Build complete. Watching for changes...');
        }
    }

    // 2. 调用 build 函数开始正式的编译
    if (args.modern) {
        // 2.1 modern mode，会fork execa 执行一次打包
        // modern mode 必须要保证 legacy 先打包完成
        if (!process.env.HULK_CLI_MODERN_BUILD) {
            // for legacy build
            // 要保证打包顺序，所以这里用 await！
            const data = await build(
                Object.assign({}, args, {
                    modernBuild: false
                }),
                plugins
            );
            if (data) {
                successBuild(data, {isModern: true});
            }
            //  execa 打包，保证打包环境的纯洁性
            const execa = require('execa');
            const cliBin = require('path').resolve(__dirname, '../../bin/hulk.js');
            const rawArgs = process.argv.slice(3);
            // TODO 这里会有权限问题？还是自己电脑权限问题？
            await execa(cliBin, ['build', ...rawArgs], {
                stdio: 'inherit',
                env: {
                    HULK_CLI_MODERN_BUILD: true
                }
            });
        } else {
            // 这里是 modern mode 的打包
            // 注意要用 clean = false 哦！！！不然会删掉 legacy-${filename}.json，legacy 打包就白费了！
            build(
                Object.assign({}, args, {
                    modernBuild: true,
                    clean: false
                }),
                plugins
            )
                .then(data => successBuild(data, {isModern: true, isModernBuild: true}))
                .catch(err => failBuild(err));
        }
    } else {
        // 普通模式打包
        build(args, plugins)
            .then(data => successBuild(data))
            .catch(err => failBuild(err));
    }
};

async function build(args, plugins = []) {
    const {mode, target, config: configFile, entry, modern = false, dest, watch} = args;

    const fse = require('fs-extra');
    const webpack = require('webpack');
    const Service = require('../../lib/Service');
    // add matrix plugin
    plugins.push(require('../../lib/serivce-plugins/matrix'));

    const service = new Service(context, {
        configFile,
        plugins
    });

    // 这里的 options 是结合 hulk.configl.js 处理之后的 options
    const options = service.init(
        mode,
        Object.assign(args, {
            target,
            modernMode: modern,
            modernBuild: modern && process.env.HULK_CLI_MODERN_BUILD,
            command: 'build'
        })
    );

    const targetDir = path.resolve(context, dest || options.outputDir);

    if (args.clean) {
        await fse.remove(targetDir);
    }

    const chainConfig = service.resolveChainableWebpackConfig();
    if (args.modern && !args.analyze) {
        const ModernModePlugin = require('../../lib/webpack/ModernModePlugin');
        if (!args.modernBuild) {
            // Inject plugin to extract build stats and write to disk
            chainConfig.plugin('modern-mode-legacy').use(ModernModePlugin, [
                {
                    targetDir,
                    isModernBuild: false
                }
            ]);
        } else {
            // Inject plugin to read non-modern build stats and inject HTML
            chainConfig.plugin('modern-mode-modern').use(ModernModePlugin, [
                {
                    targetDir,
                    isModernBuild: true
                }
            ]);
        }
    }

    if (args.analyze) {
        // 添加 analyze
        const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
        chainConfig.plugin('bundle-analyzer').use(new BundleAnalyzerPlugin());
    } else if (args.report || args['report-json']) {
        const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
        // 单独标示 modern 打包
        const bundleName = args.modern ? (args.modernBuild ? 'modern-' : 'legacy-') : '';
        chainConfig.plugin('bundle-analyzer').use(
            new BundleAnalyzerPlugin({
                logLevel: 'warn',
                openAnalyzer: false,
                analyzerMode: args.report ? 'static' : 'disabled',
                reportFilename: `${bundleName}report.html`,
                statsFilename: `${bundleName}report.json`,
                generateStatsFile: !!args['report-json']
            })
        );
    }

    // resolve webpack config
    // const webpackConfig = service.resolveWebpackConfig();
    const webpackConfig = service.resolveWebpackConfig(chainConfig);
    // console.log(webpackConfig.module.rules[7]);

    if (dest) {
        modifyConfig(webpackConfig, config => {
            config.output.path = targetDir;
        });
    }

    // --watch 功能
    if (watch) {
        modifyConfig(webpackConfig, config => {
            config.watch = true;
        });
    }

    webpackConfig.mode = mode;

    if (target === 'entry' && entry) {
        if (/\.san$/.test(entry)) {
            webpackConfig.resolve.alias['~entry'] = path.resolve(context, entry);
        } else {
            webpackConfig.entry = {
                app: entry
            };
        }
        // 默认hulk.config page 里面配置的就有 app 呢？
        // delete webpackConfig.entry.app;
    } else if (entry && !options.pages) {
        webpackConfig.entry = {app: path.resolve(context, entry)};
        // 默认hulk.config page 里面配置的就有 app 呢？
        // delete webpackConfig.entry.app;
    }

    // 处理 entry 不存在的情况
    if (!Array.isArray(webpackConfig.entry) && Object.keys(webpackConfig.entry).length === 0) {
        error('没有找到 Entry，请命令后面添加 entry 或者配置 hulk.config.js');
        process.exit(1);
    }

    // console.log(webpackConfig.plugins[webpackConfig.plugins.length-1])
    // webpackConfig.output.publicPath = './';
    // webpackConfig.optimization.runtimeChunk = true;
    return new Promise((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                return reject(err);
            }

            if (stats.hasErrors()) {
                return reject(stats);
            }
            // 这里 resolve 传出三个值：stats config 和 options
            resolve({stats, config: webpackConfig, options});
        });
    });
}

module.exports.build = build;
