const path = require('path');
exports.getReportFileName = function getReportFileName(optFilename, prefixer = '', defaultFilename = 'report.html') {
    let reportFileName = defaultFilename;
    let defaultExtName = path.extname(defaultFilename);

    if (typeof optFilename === 'string' && optFilename.length > 0) {
        // 只支持json html htm
        if (/\.(html?|json)$/.test(optFilename)) {
            reportFileName = optFilename;
        } else {
            reportFileName = optFilename + defaultExtName;
        }
    }
    if (prefixer.length > 0) {
        const baseName = path.basename(reportFileName);
        const dirName = path.dirname(reportFileName);

        reportFileName = `${dirName}/${prefixer}${baseName}`;
    }
    return reportFileName;
};

const {textCommonColor} = require('san-cli-utils/color');
const {info, success: successLog, error} = require('san-cli-utils/ttyLogger');

/**
 * @function compileSuccess 将编译成功处理逻辑的回调统一拿出来，供复用和单测
 * @param {object} - compile的结果信息
 * @param {object} - argv 环境变量
 * @param {object} - {startTime, api} 统计相关变量，api主要用到api.resolve，值为数组时需要与webpackConfig内顺序对应
 */
exports.compileSuccess = function success(
    {stats: webpackStats, isWatch},
    {analyze, isModern, isModernBuild} = {},
    {startTime, api}) {
    if (analyze) {
        successLog('Build complete. Watching for changes...');
        return;
    }

    const statsJson = webpackStats.toJson({
        all: false,
        entrypoints: true,
        assets: true,
        chunks: true,
        ids: true,
        version: true,
        timings: true,
        outputPath: true,
        moduleAssets: true,
        cachedAssets: true,
        runtimeModules: true
    });
    // sab-cli-build对于单一的config会转换为[config]，此处统一按照mulconfig处理
    statsJson.children.forEach((stats, i) => {

        // 只有在非 analyze 模式下才会输出 log
        const targetDirShort = path.resolve(stats.outputPath);

        try {
            if (!(api instanceof Array)) {
                api = [api];
            }
            const apiFn = api[i];
            const statsInfo = require('san-cli-webpack/lib/formatStats')(stats, targetDirShort, {
                resolve: p => apiFn.resolve(p)
            });
            // eslint-disable-next-line no-console
            console.log(statsInfo);
        }
        catch (err) {
            error(err);
        }

        if (!isWatch) {
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
            /* eslint-disable no-console */
            const result = JSON.parse(process.env.speedData).map(s => +s.match(/([\d.])+/)[0]);
            const fs = require('fs-extra');
            const path = require('path');
            const jsonPath = path.resolve('/Users/zhangtingting/build4.json');
            const sData = fs.readJsonSync(jsonPath) || [];
            sData.compiled.push(result[0]);
            sData.duration.push(duration);
            console.log('first compiled', sData);
            // 去掉最大和最小的
            const compiled = sData.compiled.sort().slice(1, sData.compiled.length - 1);
            const dur = sData.duration.sort().slice(1, sData.duration.length - 1);
            // 满足10条重新计算
            fs.writeJsonSync(jsonPath, compiled.length >= 10 ? {compiled: [], duration: []} : sData);
            if (compiled.length) {
                const avgCompiled = compiled.reduce((sum, num) => sum + num, 0) / compiled.length;
                const avgDuration = dur.reduce((sum, num) => sum + num, 0) / dur.length;

                successLog(
                    `Avg ${textCommonColor(`compiled: ${avgCompiled.toFixed(3)}s duration: ${avgDuration.toFixed(3)}s`)
                    }, length: ${compiled.length}.`
                );
            }
        }
    });
};

/**
 * @function compileSuccess 将编译失败处理逻辑的回调统一拿出来，供复用和单测
 * @param {object} - compile的结果信息
 */
exports.compileFail = function fail({err, stats}) {
    if (stats && stats.toJson) {
        // const info = stats.toJson();
        // error(info.errors);
    }
    else {
        info('Build failed with errors.');
        error(err ? err : 'Webpack config error, use `--verbose` flag to show debug log');
    }
    process.exit(1);
};
