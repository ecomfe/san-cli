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

module.exports = async (initEntry, args) => {
    // 开始时间
    const startTime = Date.now();
    const chalk = require('@baidu/hulk-utils/chalk');
    const report = require('../../lib/report');

    // 处理 entry 不存在的情况
    const resolveEntry = require('../../lib/utils').resolveEntry;
    args.entry = initEntry;
    if (initEntry) {
        const {entry, isFile} = resolveEntry(initEntry);
        args.entry = entry;
        args.target = args.target ? args.target : isFile ? 'page' : 'app';
        args._isFile = isFile;
    } else {
        args.target = 'app';
    }

    const mode = args.mode || process.env.NODE_ENV || 'production'; // 默认是 production
    args.mode = mode;

    const bundleTag = args.modern ? (process.env.HULK_CLI_MODERN_BUILD ? 'modern bundle ' : 'legacy bundle ') : '';
    info(`Building ${bundleTag}for ${mode}...`);

    function failBuild(err) {
        if (err && err.toJson) {
            console.log('Build failed with errors.');
            process.stderr.write(err.toString({colors: true, children: false, modules: false, chunkModules: false}));
            process.exit(1);
        } else {
            console.log(err);
        }
    }
    function successBuild({stats, config, options}, {isModern, isModernBuild} = {}) {
        const targetDir = path.resolve(context, config.output.path || args.dest || options.outputDir);
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
                report(stats, targetDirShort, {
                    resolve: p => path.resolve(context, p)
                })
            );
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
    }
    if (args.modern) {
        if (!process.env.HULK_CLI_MODERN_BUILD) {
            // main-process for legacy build
            const data = await build(
                Object.assign({}, args, {
                    modernBuild: false
                })
            );
            if (data) {
                successBuild(data, {isModern: true});
            }
            // spawn sub-process of self for modern build
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
            // sub-process for modern build
            build(
                Object.assign({}, args, {
                    modernBuild: true,
                    clean: false
                })
            )
                .then(data => successBuild(data, {isModern: true, isModernBuild: true}))
                .catch(err => failBuild(err));
        }
    } else {
        build(args)
            .then(data => successBuild(data))
            .catch(err => failBuild(err));
    }
};

async function build(args) {
    const {mode, target, config: configFile, entry, modern = false, dest, watch} = args;

    const fse = require('fs-extra');
    const webpack = require('webpack');
    const Service = require('../../lib/Service');

    const plugins = [];
    if (args.analyze) {
        // 添加 analyze
        plugins.push(require('../../lib/serivce-plugins/analyze'));
    }

    const service = new Service(context, {
        configFile,
        plugins
    });

    const options = service.init(mode, {
        target,
        modernMode: modern,
        modernBuild: modern && process.env.HULK_CLI_MODERN_BUILD,
        command: 'build'
    });

    const targetDir = path.resolve(context, dest || options.outputDir);

    if (args.clean) {
        await fse.remove(targetDir);
    }

    const chainConfig = service.resolveChainableWebpackConfig();
    if (args.modern) {
        const ModernModePlugin = require('../../lib/webpack/ModernModePlugin');
        if (!args.modernBuild) {
            // Inject plugin to extract build stats and write to disk
            chainConfig.plugin('modern-mode-legacy').use(ModernModePlugin, [
                {
                    targetDir,
                    isModernBuild: false,
                    unsafeInline: args['unsafe-inline']
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

    // resolve webpack config
    // const webpackConfig = service.resolveWebpackConfig();
    const webpackConfig = service.resolveWebpackConfig(chainConfig);
    // console.log(webpackConfig);

    if (dest) {
        modifyConfig(webpackConfig, config => {
            config.output.path = targetDir;
        });
    }

    // watch 功能
    if (watch) {
        modifyConfig(webpackConfig, config => {
            config.watch = true;
        });
    }

    webpackConfig.mode = mode;

    if (args._isFile && entry) {
        if (/\.san$/.test(entry)) {
            webpackConfig.resolve.alias['~entry'] = path.resolve(context, entry);
        } else {
            webpackConfig.entry = {
                app: entry
            };
        }
        // } else {
        // 默认hulk.config page 里面配置的就有 app 呢？
        // delete webpackConfig.entry.app;
    } else if (entry && !options.pages) {
        webpackConfig.entry = {app: path.resolve(context, entry)};
        // } else {
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

            resolve({stats, config: webpackConfig, options});
        });
    });
}

module.exports.build = build;
