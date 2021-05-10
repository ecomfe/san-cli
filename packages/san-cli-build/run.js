/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file build run
 * @author ksky521
 */

module.exports = function apply(argv, api) {
    const path = require('path');
    const {info, success: successLog, error} = require('san-cli-utils/ttyLogger');
    const {textCommonColor} = require('san-cli-utils/color');
    const getNormalizeWebpackConfig = require('./getWebpackConfig');

    const projectOptions = api.getProjectOptions();

    // 开始时间
    const startTime = Date.now();
    const mode = argv.mode; // 默认是 production

    const {watch, analyze, modern} = argv;
    // --modern + --analyze 应该显示 modern 的 analyze 的结果
    if (modern && analyze) {
        process.env.SAN_CLI_MODERN_BUILD = true;
    }
    const bundleTag = modern ? (process.env.SAN_CLI_MODERN_BUILD ? 'modern bundle ' : 'legacy bundle ') : '';
    info(`Building ${bundleTag}for ${mode}...`);

    // 编译失败处理逻辑
    function fail({err, stats}) {
        if (stats && stats.toJson) {
            // const info = stats.toJson();
            // error(info.errors);
        }
        else {
            info('Build failed with errors.');
            error(err ? err : 'Webpack config error, use `--verbose` flag to show debug log');
        }
        process.exit(1);
    }
    // 编译成功处理逻辑
    function success({stats: webpackStats}, {isModern, isModernBuild} = {}) {
        if (analyze) {
            successLog('Build complete. Watching for changes...');
            return;
        }

        const statsJson = webpackStats.toJson({
            entrypoints: true,
            assets: true,
            chunks: true,
            hash: false,
            modules: false
        });

        statsJson.children.forEach(stats => {

            // 只有在非 analyze 模式下才会输出 log
            const targetDirShort = path.resolve(stats.outputPath);

            try {
                const statsInfo = require('san-cli-webpack/lib/formatStats')(stats, targetDirShort, {
                    resolve: p => api.resolve(p)
                });
                // eslint-disable-next-line no-console
                console.log(statsInfo);
            }
            catch (err) {
                error(err);
            }

            if (!watch) {
                const duration = (Date.now() - startTime) / 1e3;
                if (isModern) {
                    if (isModernBuild) {
                        successLog('Build modern bundle success');
                    }
                    else {
                        successLog('Build legacy bundle success');
                    }
                    return;
                }
                const {time, version} = stats;
                successLog(
                    `The ${textCommonColor(targetDirShort)} directory is ready to be deployed. Duration ${
                        textCommonColor(`${duration}/${time / 1e3}s`)
                    }, Webpack ${version}.`
                );
            }
        });
    }

    // 放到这里 require 是让命令行更快加载，而不是等 webpack 这大坨东西。。
    const Build = require('san-cli-webpack/build');
    let build = null;
    if (modern) {
        // 2.1 modern mode，会 fork execa 执行一次打包
        // modern mode 必须要保证 legacy 先打包完成
        if (!process.env.SAN_CLI_MODERN_BUILD) {
            process.env.SAN_CLI_LEGACY_BUILD = 1;
            // 获取 webpack 配置
            const config = getNormalizeWebpackConfig(
                api,
                projectOptions,
                Object.assign(argv, {
                    modernBuild: false
                })
            );
            build = new Build(config);
            // for legacy build
            build.on('success', async data => {
                success(data, {isModern: true});
                // execa 打包，保证打包环境的纯洁性
                const execa = require('execa');
                const cliBin = require('path').resolve(__dirname, '../san-cli/index.js');
                const rawArgs = process.argv.slice(3);
                // TODO 这里会有权限问题？还是自己电脑权限问题？
                // https://github.com/sindresorhus/execa/issues/75
                await execa(cliBin, ['build', ...rawArgs], {
                    stdio: 'inherit',
                    env: {
                        SAN_CLI_MODERN_BUILD: true,
                        SAN_CLI_LEGACY_BUILD: 0
                    }
                });
            });
        } else {
            // 这里是 modern mode 的打包
            // 注意要用 clean = false 哦！！！不然会删掉 legacy-${filename}.json，legacy 打包就白费了！
            // 获取 webpack 配置
            const config = getNormalizeWebpackConfig(
                api,
                projectOptions,
                Object.assign(argv, {
                    modernBuild: true,
                    clean: false
                })
            );
            // for modern build
            build = new Build(config);
            build.on('success', async data => {
                success(data, {isModern: true, isModernBuild: true});
            });
        }
    } else {
        // 获取 webpack 配置
        // for build
        build = new Build(getNormalizeWebpackConfig(api, projectOptions, argv));
        build.on('success', success);
    }
    build.on('fail', fail);
    build.run();
};
