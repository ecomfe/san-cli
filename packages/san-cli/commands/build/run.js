/**
 * @file build run
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const {info, chalk, success: successLog} = require('san-cli-utils/ttyLogger');
const getNormalizeWebpackConfig = require('./getNormalizeWebpackConfig');
module.exports = function apply(api, projectOptions) {
    return argv => {
        // 开始时间
        const startTime = Date.now();
        const mode = argv.mode || process.env.NODE_ENV || 'production'; // 默认是 production
        // 重新赋值
        argv.mode = mode;

        const {watch, analyze, verbose, dest, modern} = argv;
        // --modern + --analyze 应该显示 modern 的 analyze 的结果
        if (modern && analyze) {
            process.env.SAN_CLI_MODERN_BUILD = true;
        }
        const bundleTag = modern ? (process.env.SAN_CLI_MODERN_BUILD ? 'modern bundle ' : 'legacy bundle ') : '';
        info(`Building ${bundleTag}for ${mode}...`);

        // 获取 webpack 配置
        function fail({err, stats}) {
            console.log('Build failed with errors.');
            if (stats && stats.toJson) {
                process.stderr.write(
                    stats.toString({
                        colors: true,
                        children: false,
                        modules: false,
                        chunkModules: false
                    })
                );
            } else {
                console.log(err);
            }
            process.exit(1);
        }
        // 编译成功处理逻辑
        function success({stats: webpackStats}, {isModern, isModernBuild} = {}) {
            if (!analyze) {
                // 只有在非 analyze 模式下才会输出 log
                const targetDir = api.resolve(dest || projectOptions.outputDir);
                const targetDirShort = path.relative(api.getCwd(), targetDir);
                const stats = webpackStats.toJson({
                    all: false,
                    entrypoints: true,
                    assets: true,
                    chunks: true,
                    version: true,
                    timings: true,
                    performance: true
                });

                if (verbose) {
                    argv.stats = 'verbose';
                }
                if (argv.stats === 'table') {
                    //  TODO：这里有问题，需要调试下 hulk 的 report 代码
                    console.log(
                        require('../../webpack/report')(stats, targetDirShort, {
                            resolve: p => api.resolve(p)
                        })
                    );
                } else {
                    const Stats = require('webpack/lib/Stats');
                    const statsOptions = Stats.presetToOptions(argv.stats);
                    statsOptions.colors = !!argv.colors || !!argv.color;
                    console.log(webpackStats.toString(statsOptions));
                }
                if (!watch) {
                    const duration = (Date.now() - startTime) / 1e3;
                    if (isModern) {
                        if (isModernBuild) {
                            successLog('Build modern bundle success');
                        } else {
                            successLog('Build legacy bundle success');
                            console.log();
                        }
                        return;
                    }
                    const {time, version} = stats;
                    successLog(
                        `The ${chalk.cyan(targetDirShort)} directory is ready to be deployed. Duration ${chalk.cyan(
                            `${duration}/${time / 1e3}s`
                        )}, Webpack ${version}.`
                    );
                }
            }
            if (watch) {
                successLog('Build complete. Watching for changes...');
            }
        }

        // 放到这里 require 是让命令行更快加载，而不是等 webpack 这大坨东西。。
        const build = require('../../webpack/build');
        if (modern) {
            // 2.1 modern mode，会fork execa 执行一次打包
            // modern mode 必须要保证 legacy 先打包完成
            if (!process.env.SAN_CLI_MODERN_BUILD) {
                process.env.SAN_CLI_LEGACY_BUILD = true;
                // 获取 webpack 配置
                let config = getNormalizeWebpackConfig(
                    api,
                    projectOptions,
                    Object.assign({}, argv, {
                        modernBuild: false
                    })
                );
                // for legacy build
                build({
                    webpackConfig: config,
                    success: async data => {
                        success(data, {isModern: true});
                        // execa 打包，保证打包环境的纯洁性
                        const execa = require('execa');
                        const cliBin = require('path').resolve(__dirname, '../../index.js');
                        const rawArgs = process.argv.slice(3);
                        // TODO 这里会有权限问题？还是自己电脑权限问题？
                        // https://github.com/sindresorhus/execa/issues/75
                        await execa(cliBin, ['build', ...rawArgs], {
                            stdio: 'inherit',
                            env: {
                                SAN_CLI_MODERN_BUILD: true,
                                SAN_CLI_LEGACY_BUILD: false
                            }
                        });
                    },
                    fail
                });
            } else {
                // 这里是 modern mode 的打包
                // 注意要用 clean = false 哦！！！不然会删掉 legacy-${filename}.json，legacy 打包就白费了！
                // 获取 webpack 配置
                let config = getNormalizeWebpackConfig(
                    api,
                    projectOptions,
                    Object.assign({}, argv, {
                        modernBuild: true,
                        clean: false
                    })
                );
                // for modern build
                build({
                    webpackConfig: config,
                    success: data => {
                        success(data, {isModern: true, isModernBuild: true});
                    },
                    fail
                });
            }
        } else {
            // 获取 webpack 配置
            let config = getNormalizeWebpackConfig(api, projectOptions, argv);
            // for build
            build({webpackConfig: config, success, fail});
        }
    };
};
