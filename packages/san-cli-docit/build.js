/**
 * @file build
 * @author ksky521
 */
const path = require('path');
const {info, success: successLog, error} = require('san-cli-utils/ttyLogger');

module.exports = function build(argv, api, projectOptions) {
    // 开始时间
    const startTime = Date.now();
    const mode = argv.mode || process.env.NODE_ENV || 'production'; // 默认是 production
    info(`Building for docit(${mode})...`);

    const {textColor} = require('san-cli-utils/randomColor');
    const getNormalizeWebpackConfig = require('./getNormalizeWebpackConfig');
    // 重新赋值
    argv.mode = mode;

    const {dest} = argv;

    // 获取 webpack 配置
    function fail({err, stats}) {
        info('Build failed with errors.');
        if (stats && stats.toJson) {
            // const info = stats.toJson();
            // error(info.errors);
        }
        else {
            error(err ? err : 'Webpack config error, use `--verbose` flag to show debug log');
        }
        process.exit(1);
    }
    // 编译成功处理逻辑
    function success({stats: webpackStats}) {
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
        console.log(
            require('san-cli-webpack/lib/formatStats')(stats, targetDirShort, {
                resolve: p => api.resolve(p)
            })
        );
        const duration = (Date.now() - startTime) / 1e3;

        const {time, version} = stats;
        successLog(
            `The ${textColor(targetDirShort)} directory is ready to be deployed. Duration ${textColor(
                `${duration}/${time / 1e3}s`
            )}, Webpack ${version}.`
        );
    }

    // 放到这里 require 是让命令行更快加载，而不是等 webpack 这大坨东西。。
    const build = require('san-cli-webpack/build');

    // 获取 webpack 配置
    // for build
    // console.log(getNormalizeWebpackConfig(argv, api, projectOptions))
    build({webpackConfig: getNormalizeWebpackConfig(argv, api, projectOptions)})
        .then(success)
        .catch(fail);
};
