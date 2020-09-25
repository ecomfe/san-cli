/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 将 build 的 webpackConfig 处理拆出来
 * @author ksky521
 */
const fse = require('fs-extra');
const {resolveEntry} = require('san-cli-webpack/utils');
const {error, chalk} = require('san-cli-utils/ttyLogger');

module.exports = function getNormalizeWebpackConfig(api, projectOptions, argv) {
    // 读取 cli 传入的 argv
    const {mode, entry, dest, analyze, watch, clean, remote, report, statsJson, modern, modernBuild = false} = argv;
    const targetDir = api.resolve(dest || projectOptions.outputDir);

    if (clean) {
        // 删掉目录
        fse.removeSync(targetDir);
    }

    const chainConfig = api.getWebpackChainConfig();
    // modern mode
    if (modern && !analyze) {
        const ModernModePlugin = require('san-cli-webpack/lib/ModernModePlugin');
        if (!modernBuild) {
            // Inject plugin to extract build stats and write to disk
            chainConfig.plugin('modern-mode-legacy').use(ModernModePlugin, [
                {
                    targetDir,
                    isModernBuild: false
                }
            ]);
        }
        else {
            // Inject plugin to read non-modern build stats and inject HTML
            chainConfig.plugin('modern-mode-modern').use(ModernModePlugin, [
                {
                    targetDir,
                    isModernBuild: true
                }
            ]);
        }
    }
    if (analyze) {
        // 添加 analyze
        const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
        chainConfig.plugin('bundle-analyzer').use(new BundleAnalyzerPlugin());
    }
    else if (report || statsJson) {
        const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
        const {getReportFileName} = require('../../lib/utils');
        // 单独标示 modern 打包
        const bundleName = modern ? (modernBuild ? 'modern-' : 'legacy-') : '';
        const reportFilename = getReportFileName(report, bundleName, 'report.html');
        const statsFilename = getReportFileName(statsJson, bundleName, 'stats.json');
        chainConfig.plugin('bundle-analyzer').use(
            new BundleAnalyzerPlugin({
                logLevel: 'warn',
                openAnalyzer: false,
                analyzerMode: 'static',
                reportFilename,
                statsFilename,
                generateStatsFile: !!statsJson
            })
        );
    }
    // 添加远程部署
    if (remote) {
        const DeployPlugin = require('deploy-files/webpack-plugin');
        // 从 env 文件中读取 remote 配置，这样可以将 env.local 加到 .gitignore 中防止提交
        // 详细配置：https://github.com/jinzhan/deploy-files
        // host: 'http://YOUR_HOST'
        // receiver: 'http://YOUR_HOST/receiver',
        // templatePath: '/home/work/nginx_static/html/test/template',
        // staticPath: '//home/work/nginx_static/html/test/static',
        // staticDomain: 'http://test.com:8888'
        // baseUrl: 'https://s.bdstatic.com/'
        const upperRemote = remote.toUpperCase();
        const requiredParam = ['templatePath', 'staticPath', 'staticDomain', 'baseUrl'];
        const remoteObj = {
            // 1. 默认取false;
            // 2. process.env读取的内容为string，需转boolean
            disableFsr: JSON.parse(process.env[`SAN_REMOTE_${upperRemote}_DISABLE_FSR`] || false)
        };
        requiredParam.push(remoteObj.disableFsr ? 'receiver' : 'host');

        requiredParam.forEach(key => {
            // templatePath → TEMPLATE_PATH
            const upperKey = key.replace(/[A-Z]/g, $1 => `_${$1}`).toUpperCase();
            const val = process.env[`SAN_REMOTE_${upperRemote}_${upperKey}`];
            if (!val) {
                error(
                    /* eslint-disable max-len */
                    `Use --remote ${remote} to upload files, but donot get ${chalk.red(
                        `SAN_REMOTE_${upperRemote}_${upperKey}`
                    )} from process.env.`
                    /* eslint-enable max-len */
                );
                process.exit(1);
            }
            else {
                remoteObj[key] = process.env[`SAN_REMOTE_${upperRemote}_${upperKey}`];
            }
        });
        chainConfig.plugin('deploy-files').use(DeployPlugin, [remoteObj]);
    }

    // resolve webpack config
    let webpackConfig = api.getWebpackConfig(chainConfig);

    // --dest
    if (dest) {
        webpackConfig.output.path = targetDir;
    }

    // --watch 功能
    if (watch) {
        webpackConfig.watch = true;
    }

    // --mode
    webpackConfig.mode = mode;

    // entry
    if (entry) {
        webpackConfig = resolveEntry(entry, api.resolve(entry), webpackConfig);
    }
    return webpackConfig;
};
