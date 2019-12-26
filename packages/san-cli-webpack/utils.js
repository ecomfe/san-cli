/**
 * @file webpack 相关函数
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

exports.isJS = val => /\.js$/.test(val);
exports.isCSS = val => /\.css$/.test(val);
// webpack 相关
exports.addDevClientToEntry = (config, devClient) => {
    const {entry} = config; // eslint-disable-line
    if (typeof entry === 'object' && !Array.isArray(entry)) {
        Object.keys(entry).forEach(key => {
            entry[key] = devClient.concat(entry[key]);
        });
    } else if (typeof entry === 'function') {
        config.entry = entry(devClient);
    } else {
        config.entry = devClient.concat(entry);
    }
};

exports.getWebpackErrorInfoFromStats = (err, stats) => {
    if (!stats.stats) {
        return {
            err: err || (stats.compilation && stats.compilation.errors && stats.compilation.errors[0]),
            stats,
            rawStats: stats
        };
    }
    const [curStats] = stats.stats;
    return {
        err: err || (curStats.compilation && curStats.compilation.errors && curStats.compilation.errors[0]),
        stats: curStats,
        rawStats: stats
    };
};

/**
 * @file 将处理 entry 的情况单独拿出来，供复用和单测
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
const path = require('path');
const fse = require('fs-extra');
const {error} = require('@baidu/san-cli-utils/ttyLogger');
exports.resolveEntry = (resolveEntryPath, absoluteEntryPath, webpackConfig, defaultEntry) => {
    // entry arg
    if (resolveEntryPath) {
        // 1. 判断 entry 是文件还是目录
        // 2. 文件，直接启动 file server
        // 3. 目录，则直接启动 devServer
        const obj = resolveEntry(absoluteEntryPath);
        resolveEntryPath = obj.entry;
        const isFile = obj.isFile;

        webpackConfig.entry = webpackConfig.entry || {};
        if (isFile && !/\.san$/.test(resolveEntryPath)) {
            webpackConfig.entry.app = resolveEntryPath;
        } else {
            webpackConfig.entry.app = defaultEntry;
            // san 文件/目录的情况需要指定 ~entry
            webpackConfig.resolve.alias['~entry'] = absoluteEntryPath;
        }
    }
    // 处理 entry 不存在的情况
    if (
        /* eslint-disable operator-linebreak */
        !webpackConfig.entry ||
        /* eslint-enable operator-linebreak */
        (!Array.isArray(webpackConfig.entry) && Object.keys(webpackConfig.entry).length === 0)
    ) {
        error('Entry not found, please add an entry or configure san.config.js.');
        process.exit(1);
    }
    return webpackConfig;
};

function resolveEntry(entry) {
    let isFile = false;
    try {
        const stats = fse.statSync(entry);
        if (stats.isFile()) {
            const ext = path.extname(entry);
            if (ext === '.js' || ext === '.san') {
                isFile = true;
            } else {
                error('A valid entry file should be one of: *.js or *.san.');
                process.exit(1);
            }
            isFile = true;
        }
    } catch (e) {
        error('A valid entry should be a file or a directory.');
        process.exit(1);
    }
    return {
        entry,
        isFile
    };
}
