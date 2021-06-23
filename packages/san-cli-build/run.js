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
    const {info} = require('san-cli-utils/ttyLogger');
    const getNormalizeWebpackConfig = require('./getWebpackConfig');
    const {compileSuccess, compileFail} = require('./utils');
    const projectOptions = api.getProjectOptions();

    // 开始时间
    const startTime = Date.now();
    const mode = argv.mode; // 默认是 production

    const {analyze, modern} = argv;
    // --modern + --analyze 应该显示 modern 的 analyze 的结果
    if (modern && analyze) {
        process.env.SAN_CLI_MODERN_BUILD = true;
    }
    const bundleTag = modern ? (process.env.SAN_CLI_MODERN_BUILD ? 'modern bundle ' : 'legacy bundle ') : '';
    info(`Building ${bundleTag}for ${mode}...`);


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
                compileSuccess(data, {analyze, isModern: true}, {startTime, api});
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
            build.on('success', data => {
                compileSuccess(data, {analyze, isModern: true, isModernBuild: true}, {startTime, api});
            });
        }
    } else {
        // 获取 webpack 配置
        // for build
        build = new Build(getNormalizeWebpackConfig(api, projectOptions, argv));
        build.on('success', data => compileSuccess(data, {analyze}, {startTime, api}));
    }
    build.on('fail', compileFail);
    build.run();
};
