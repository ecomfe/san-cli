/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file webpack 相关函数
 * @author ksky521
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
 * @author ksky521
 */
const path = require('path');
const fse = require('fs-extra');
const {error} = require('san-cli-utils/ttyLogger');
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
        const isSanFile = /\.san$/.test(resolveEntryPath);
        if (isFile && !isSanFile) {
            webpackConfig.entry.app = resolveEntryPath;
        } else {
            webpackConfig.entry.app = defaultEntry;
            // san 文件/目录的情况需要指定 ~entry
            webpackConfig.resolve.alias['~entry'] = absoluteEntryPath;
        }
        if (isSanFile) {
            webpackConfig.cache = false;
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


/**
 * @file 集中处理devServer的参数
 * @author
 */

const {prepareUrls} = require('san-cli-utils/path');
const portfinder = require('portfinder');
const url = require('url');

exports.getServerParams = async (devServerConfig, publicPath) => {

    const {https, host, port: basePort, public: rawPublicUrl} = devServerConfig;
    const protocol = https ? 'https' : 'http';
    portfinder.basePort = basePort;
    // 查找空闲的 port
    const port = await portfinder.getPortPromise();
    const publicUrl = rawPublicUrl
        ? /^[a-zA-Z]+:\/\//.test(rawPublicUrl)
            ? rawPublicUrl
            : `${protocol}://${rawPublicUrl}`
        : null;
    const urls = prepareUrls(protocol, host, port, publicPath);
    /* eslint-disable */
    const sockjsUrl = publicUrl
        ? `?${publicUrl}/sockjs-node`
        : `?${url.format({
            protocol,
            port,
            hostname: urls.lanUrlForConfig || 'localhost',
            pathname: '/sockjs-node'
        })}`;
    /* eslint-enable */
    const networkUrl = publicUrl
        ? publicUrl.replace(/([^/])$/, '$1/')
        : url.format({
            protocol,
            port,
            hostname: urls.lanUrlForConfig || 'localhost'
        });

    return {
        https,
        port,
        host,
        protocol,
        publicUrl,
        urls,
        sockjsUrl,
        networkUrl
    };
};

const {getDebugLogger} = require('san-cli-utils/ttyLogger');
const SanFriendlyErrorsPlugin = require('./lib/SanFriendlyErrorsPlugin');
const closeDevtoolDebug = getDebugLogger('webpack:closeDevtool');

exports.initConfig = webpackConfig => {
    let config = Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig];
    let isWatch = false;
    let watchOptions = null;
    let devServerConfig = null;

    config = config.map(c => {
        // 添加插件
        c.plugins.push(new SanFriendlyErrorsPlugin());

        if (closeDevtoolDebug.enabled) {
            // 使用 DEBUG=san-cli:webpack:closeDevtool 开启
            c.devtool = false;
            c.optimization = {
                minimize: false
            };
        }
        // mode 不是 production 则添加 hmr 功能
        if (c.mode !== 'production' && c.devServer) {
            // 多个配置只取第一个 devServer
            if (!devServerConfig) {
                // create server
                const defaultDevServer = {
                    // 这里注意，这个配置的是 outputDir
                    contentBase: path.resolve('public'),
                    // 这里注意：
                    // 如果是 contentBase = outputDir 谨慎打开，打开后 template 每次文件都会重写，从而导致 hmr 失效，每次都 reload 页面
                    watchContentBase: false,

                    // 处理 tpl 的情况，smarty copy 到 output
                    writeToDisk: filePath => /\.tpl$/.test(filePath),

                    publicPath: c.output.publicPath
                };

                devServerConfig = Object.assign(defaultDevServer, c.devServer);
            }
        }
        // 取第一个配置，执行watch函数，无需再添加config.watch
        if (typeof c.watch !== 'undefined') {
            if (!isWatch) {
                watchOptions = c.watchOptions;
                isWatch = c.watch;
            }
            delete c.watch;
        }
        return c;
    });
    return {
        config,
        isWatch,
        watchOptions,
        devServerConfig
    };
};
